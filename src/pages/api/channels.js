let channelsCache = null;
let lastFetch = 0;
let fetchInProgress = false;
let fetchPromise = null;
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours for better performance
const MAX_RETRIES = 3;
const FETCH_TIMEOUT = 45000; // 45 seconds timeout

export default async function handler(req, res) {
  const { country, limit = 50, page = 1, search = '', category } = req.query;

  // Validate inputs
  const numLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
  const numPage = Math.max(parseInt(page) || 1, 1);

  try {
    // Check if we need to fetch fresh data
    const needsFetch = !channelsCache || Date.now() - lastFetch > CACHE_DURATION;
    
    if (needsFetch) {
      if (fetchInProgress && fetchPromise) {
        // Wait for the in-progress fetch to complete
        await fetchPromise;
      } else {
        // Start a new fetch
        fetchInProgress = true;
        fetchPromise = fetchChannelsData().finally(() => {
          fetchInProgress = false;
          fetchPromise = null;
        });
        await fetchPromise;
      }
    }
    
    async function fetchChannelsData() {
      // Enhanced fetch with timeout and retry logic
      const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
            
            const response = await fetch(url, { 
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; IPTV-Proxy/1.0)',
                'Accept': '*/*',
                'Cache-Control': 'no-cache'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            
            return url.endsWith('.json') ? response.json() : response.text();
          } catch (error) {
            console.warn(`Fetch attempt ${i + 1} failed for ${url}:`, error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          }
        }
      };

      const [channelsRes, m3uRes1, m3uRes2, m3uRes3, m3uRes4, m3uRes5] = await Promise.allSettled([
        fetchWithRetry('https://iptv-org.github.io/api/channels.json'),
        fetchWithRetry('https://iptv-org.github.io/iptv/index.m3u'),
        fetchWithRetry('https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8'),
        fetchWithRetry('https://raw.githubusercontent.com/iptv-org/iptv/master/channels/us.m3u'),
        fetchWithRetry('https://raw.githubusercontent.com/iptv-org/iptv/master/channels/uk.m3u'),
        fetchWithRetry('https://raw.githubusercontent.com/FunctionError/PiratesTv/main/combined_playlist.m3u')
      ]);

      // Extract successful results
      const channelsData = channelsRes.status === 'fulfilled' ? channelsRes.value : [];
      const m3uData1 = m3uRes1.status === 'fulfilled' ? m3uRes1.value : '';
      const m3uData2 = m3uRes2.status === 'fulfilled' ? m3uRes2.value : '';
      const m3uData3 = m3uRes3.status === 'fulfilled' ? m3uRes3.value : '';
      const m3uData4 = m3uRes4.status === 'fulfilled' ? m3uRes4.value : '';
      const m3uData5 = m3uRes5.status === 'fulfilled' ? m3uRes5.value : '';

      const channelsMap = new Map();
      const channelsByName = new Map();
      if (Array.isArray(channelsData)) {
         channelsData.forEach((c) => {
           if (c.id) channelsMap.set(c.id, c);
           if (c.name) channelsByName.set(c.name.toLowerCase().trim(), c);
         });
      }

      const m3uRes = m3uData1 + '\n' + m3uData2 + '\n' + m3uData3 + '\n' + m3uData4 + '\n' + m3uData5;
      const lines = m3uRes.split('\n');
      const combined = [];
      let currentAttrs = {};
      let currentName = '';

      for (let i = 0; i < lines.length; i++) {
         const line = lines[i].trim();
         if (line.startsWith('#EXTINF')) {
            const attrParts = line.match(/([a-zA-Z0-9_-]+)="([^"]*)"/g);
            currentAttrs = {};
            if (attrParts) {
               attrParts.forEach(part => {
                  const [key, value] = part.split('=');
                  currentAttrs[key] = value.replace(/"/g, '');
               });
            }
            const commaIndex = line.lastIndexOf(',');
            currentName = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown';
         } else if (line !== '' && !line.startsWith('#')) {
            const tvgId = currentAttrs['tvg-id'];
            const cleanId = tvgId ? tvgId.split('@')[0] : null; 
            
            // Try looking up by ID, then gracefully fallback to searching by exact Name
            let cInfo = cleanId ? channelsMap.get(cleanId) : null;
            if (!cInfo && currentName) {
               cInfo = channelsByName.get(currentName.toLowerCase().trim());
            }
            cInfo = cInfo || {};
            
            const finalName = currentName || cInfo.name || "Unknown Channel";
            
            // Cascading logo resolution: 1. Playlist logo, 2. JSON DB logo, 3. Web Logo Generator (Clearbit/Google Favicon), 4. UI Avatar (In Player onError)
            const providedLogo = currentAttrs['tvg-logo'];
            const dbLogo = cInfo.logo;
            let finalLogo = '';
            
            if (providedLogo && providedLogo.trim() !== '') {
               finalLogo = providedLogo;
            } else if (dbLogo && dbLogo.trim() !== '') {
               finalLogo = dbLogo;
            } else {
               // Generate from web using domain guessing
               const cleanDomainName = finalName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'tv';
               finalLogo = `https://logo.clearbit.com/${cleanDomainName}.tv`;
            }
            
            combined.push({
               id: cleanId || `unknown-${combined.length}`,
               name: finalName,
               logo: finalLogo,
               category: currentAttrs['group-title'] || (Array.isArray(cInfo.categories) && cInfo.categories[0]) || "General",
               country: cInfo.country || "Int",
               url: line
            });
            // Reset state
            currentAttrs = {};
            currentName = '';
         }
      }

      // Filter out duplicate or unplayable entries based on url, if any
      const uniqueMap = new Map();
      combined.forEach(c => {
         // Prefer keeping channels that have an explicit logo provided rather than generated text
         if (!uniqueMap.has(c.id) || (c.logo && !c.logo.includes('ui-avatars'))) {
            uniqueMap.set(c.id, c);
         }
      });

      channelsCache = Array.from(uniqueMap.values());
      lastFetch = Date.now();
    }

    let results = channelsCache || [];

    if (country && country !== 'all') {
       results = results.filter(c => c.country?.toLowerCase() === country.toLowerCase());
    }

    if (category && category !== 'all') {
       results = results.filter(c => c.category?.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
       results = results.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Pagination with validated limits
    const startIndex = (numPage - 1) * numLimit;
    const paginated = results.slice(startIndex, startIndex + numLimit);

    // Add response headers for caching
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(200).json({
       total: results.length,
       total_pages: Math.ceil(results.length / numLimit) || 1,
       page: numPage,
       limit: numLimit,
       cached: !!channelsCache,
       last_updated: lastFetch,
       results: paginated
    });
  } catch (err) {
    console.error('Failed to parse IPTV content:', err);
    fetchInProgress = false; // Reset on error
    
    // Return cached data if available, otherwise error
    if (channelsCache && channelsCache.length > 0) {
      const fallbackLimit = Math.min(numLimit, 50);
      const results = channelsCache.slice(0, fallbackLimit);
      return res.status(200).json({
        total: channelsCache.length,
        total_pages: Math.ceil(channelsCache.length / fallbackLimit) || 1,
        page: 1,
        limit: fallbackLimit,
        cached: true,
        error: "Using cached data due to fetch error",
        results
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch channels", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}


