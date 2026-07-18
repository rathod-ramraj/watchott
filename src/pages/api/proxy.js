export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: "Invalid URL scheme" });
  }

  // Security check - prevent internal network access
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost, private IPs, and internal networks
    const isPrivateIP = (host) => {
      if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local') || host.endsWith('.internal')) return true;
      if (host.startsWith('192.168.') || host.startsWith('10.')) return true;
      // Check 172.16.0.0/12 range (172.16.x.x - 172.31.x.x)
      if (host.startsWith('172.')) {
        const secondOctet = parseInt(host.split('.')[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) return true;
      }
      return false;
    };

    if (isPrivateIP(hostname)) {
      return res.status(403).json({ error: "Access to internal networks not allowed" });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Retry logic for fetching
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      // Longer timeout for live streams
      const timeoutDuration = url.includes('.m3u8') ? 60000 : 45000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const origin = new URL(url).origin;
      const fetchHeaders = {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': origin,
        'Origin': origin,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      };

      // Pass through range headers for seeking support
      if (req.headers.range) {
        fetchHeaders['Range'] = req.headers.range;
      }

      const response = await fetch(url, { 
        headers: fetchHeaders,
        signal: controller.signal,
        // Keep-alive for streaming
        keepalive: true,
      });
      
      clearTimeout(timeoutId);

      // If we got a response, break out of retry loop
      if (response.ok || response.status === 206) {
        // Enhanced CORS with specific headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Timing-Allow-Origin', '*');

        if (req.method === 'OPTIONS' || req.method === 'HEAD') {
           return res.status(200).end();
        }

        res.status(response.status);

        const contentType = response.headers.get('content-type') || '';
        if (contentType) res.setHeader('Content-Type', contentType);
        
        // Pass through important headers for streaming
        const contentRange = response.headers.get('content-range');
        if (contentRange) res.setHeader('Content-Range', contentRange);
        
        const acceptRanges = response.headers.get('accept-ranges');
        if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);

        const contentLength = response.headers.get('content-length');
        if (contentLength) res.setHeader('Content-Length', contentLength);
        
        // Better cache control for streaming
        const urlLower = url.toLowerCase();
        const isPlaylist = urlLower.split('?')[0].endsWith('.m3u8') || urlLower.split('?')[0].endsWith('.m3u');
        const isSegment = urlLower.match(/\.(ts|aac|mp4|webm|m4s|m4v|m4a)(\?|$)/i);
        
        if (isPlaylist) {
          // No cache for playlists (they update frequently for live streams)
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (isSegment) {
          // Short cache for segments (30 seconds to 5 minutes)
          res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
        } else {
          // Default cache for other content
          res.setHeader('Cache-Control', 'public, max-age=300');
        }

        const isTextContent = contentType.includes('text') || 
                              contentType.includes('mpegurl') || 
                              contentType.includes('application/x-mpegURL') || 
                              contentType.includes('application/vnd.apple.mpegurl') ||
                              url.split('?')[0].toLowerCase().endsWith('.m3u') || 
                              url.split('?')[0].toLowerCase().endsWith('.m3u8') ||
                              url.toLowerCase().includes('.m3u8?');

        if (isTextContent) {
          const text = await response.text();
          const originBase = new URL(response.url || url);

          const rewritten = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#EXT') && trimmed.includes('URI=')) {
               return line.replace(/URI=["']([^"']+)["']/g, (match, keyUrl) => {
                  try {
                     const absUrl = new URL(keyUrl, originBase).href;
                     return `URI="/api/proxy?url=${encodeURIComponent(absUrl)}"`;
                  } catch {
                     return match;
                  }
               });
            }
            
            if (trimmed.startsWith('#') || trimmed === '') return line;
            
            try {
              const absoluteUrl = new URL(trimmed, originBase).href;
              return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            } catch {
               return line;
             }
          }).join('\n');

          return res.send(rewritten);
        } else {
          // Enhanced streaming with backpressure handling
          if (typeof response.body?.getReader === 'function') {
            const reader = response.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Handle backpressure
                if (!res.write(value)) {
                  // Buffer full, wait for drain event
                  await new Promise((resolve) => res.once('drain', resolve));
                }
              }
            } catch (streamErr) {
              console.error('Stream error:', streamErr);
              if (!res.headersSent) {
                return res.status(500).json({ error: "Stream transfer error" });
              }
            } finally {
              if (reader) {
                try { reader.releaseLock?.(); } catch { /* ignore */ }
              }
              if (!res.writableEnded) {
                res.end();
              }
            }
            return;
          } else {
            // Fallback for older browsers or non-streamable responses
            const buffer = await response.arrayBuffer();
            return res.send(Buffer.from(buffer));
          }
        }
      }
      
      // If response not ok, throw to trigger retry
      throw new Error(`HTTP ${response.status}`);
      
    } catch (err) {
      lastError = err;
      console.warn(`Proxy attempt ${attempt + 1}/${MAX_RETRIES} failed for ${url}:`, err.message);
      
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
      }
    }
  }
  
  // All retries exhausted
  console.error('Proxy Error for URL:', url, lastError?.message);
  
  // More specific error handling
  if (lastError?.name === 'AbortError') {
    return res.status(408).json({ error: "Request timeout - stream may be unavailable" });
  }
  
  if (lastError?.code === 'ECONNRESET' || lastError?.code === 'ENOTFOUND') {
    return res.status(502).json({ error: "Unable to connect to stream source" });
  }
  
  if (!res.writableEnded) {
      return res.status(500).json({ error: "Stream proxy error", details: lastError?.message });
  }
}
