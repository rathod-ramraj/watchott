// Videasy.net API Integration Endpoint
// Supports both IMDB and TMDB IDs with quality selection

export default async function handler(req, res) {
  const { 
    id,           // IMDB ID (ttxxxxxx) or TMDB ID
    type = 'movie', // 'movie' or 'tv'
    season,       // Required for TV shows
    episode,      // Required for TV shows
    tmdb = '0',   // Set to '1' if using TMDB ID
    quality = 'auto', // 'auto', '1080', '720', '480'
    sub = 'en',   // Subtitle language (en, es, fr, etc.)
    autoplay = '0', // '1' to enable autoplay
    mute = '0',   // '1' to start muted
    poster = ''   // Custom poster URL
  } = req.query;

  if (!id) {
    return res.status(400).json({ 
      error: 'ID is required',
      usage: '/api/videasy?id=tt1375666&type=movie',
      examples: [
        '/api/videasy?id=tt1375666&type=movie',
        '/api/videasy?id=1399&type=tv&season=1&episode=1&tmdb=1',
        '/api/videasy?id=tt0944947&type=tv&season=8&episode=3&quality=1080'
      ]
    });
  }

  // Validate type
  if (!['movie', 'tv'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "movie" or "tv"' });
  }

  // Validate TV parameters
  if (type === 'tv' && (!season || !episode)) {
    return res.status(400).json({ 
      error: 'Season and episode are required for TV shows',
      example: '/api/videasy?id=tt0944947&type=tv&season=1&episode=1'
    });
  }

  try {
    // Build the embed URL
    let embedUrl;
    
    if (type === 'movie') {
      embedUrl = `https://player.videasy.net/embed/movie/${id}`;
    } else {
      embedUrl = `https://player.videasy.net/embed/tv/${id}/${season}/${episode}`;
    }

    // Add optional parameters
    const params = new URLSearchParams();
    
    if (tmdb === '1') {
      params.append('tmdb', '1');
    }
    
    if (quality !== 'auto') {
      params.append('q', quality);
    }
    
    if (sub && sub !== 'en') {
      params.append('sub', sub);
    }
    
    if (autoplay === '1') {
      params.append('autoplay', '1');
    }
    
    if (mute === '1') {
      params.append('mute', '1');
    }
    
    if (poster) {
      params.append('poster', poster);
    }

    const finalUrl = params.toString() 
      ? `${embedUrl}?${params.toString()}` 
      : embedUrl;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Return based on request type
    if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        data: {
          embed_url: finalUrl,
          iframe_html: `<iframe src="${finalUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media"></iframe>`,
          direct_url: finalUrl,
          type,
          id,
          season: type === 'tv' ? season : null,
          episode: type === 'tv' ? episode : null,
          parameters: {
            tmdb: tmdb === '1',
            quality,
            subtitle: sub,
            autoplay: autoplay === '1',
            mute: mute === '1'
          }
        },
        documentation: {
          endpoints: {
            movie: '/api/videasy?id={imdb_or_tmdb}&type=movie',
            tv: '/api/videasy?id={imdb_or_tmdb}&type=tv&season={s}&episode={e}'
          },
          parameters: {
            id: 'IMDB ID (ttxxxxxx) or TMDB ID number',
            type: 'movie or tv',
            season: 'TV season number (required for tv)',
            episode: 'TV episode number (required for tv)',
            tmdb: 'Set to 1 if using TMDB ID instead of IMDB',
            quality: 'Video quality: auto, 1080, 720, 480',
            sub: 'Subtitle language code (en, es, fr, etc.)',
            autoplay: 'Set to 1 to enable autoplay',
            mute: 'Set to 1 to start muted',
            poster: 'Custom poster image URL'
          }
        }
      });
    }

    // Redirect to the embed URL
    return res.redirect(302, finalUrl);

  } catch (error) {
    console.error('Videasy API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate Videasy embed URL',
      details: error.message 
    });
  }
}
