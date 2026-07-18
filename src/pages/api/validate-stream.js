// Stream validation and testing endpoint

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Stream URL is required' });
  }

  try {
    const startTime = Date.now();
    
    // Test stream accessibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Stream-Validator/1.0)',
        'Accept': '*/*'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    const validation = {
      url,
      accessible: response.ok,
      statusCode: response.status,
      responseTime: `${responseTime}ms`,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      supportsRanges: response.headers.get('accept-ranges') === 'bytes',
      lastModified: response.headers.get('last-modified'),
      etag: response.headers.get('etag'),
      cacheControl: response.headers.get('cache-control'),
      timestamp: new Date().toISOString()
    };

    // Analyze stream type
    const contentType = response.headers.get('content-type') || '';
    const urlLower = url.toLowerCase();
    
    if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL') || urlLower.includes('.m3u8')) {
      validation.streamType = 'HLS';
      validation.isLiveStream = urlLower.includes('live') || urlLower.includes('stream');
    } else if (contentType.includes('dash') || urlLower.includes('.mpd')) {
      validation.streamType = 'MPEG-DASH';
    } else if (contentType.includes('video/mp4') || urlLower.includes('.mp4')) {
      validation.streamType = 'MP4';
    } else if (contentType.includes('video/quicktime') || urlLower.includes('.mov')) {
      validation.streamType = 'MOV';
    } else {
      validation.streamType = 'Unknown';
    }

    // Quality assessment based on response time and headers
    let quality = 'unknown';
    if (response.ok && responseTime < 1000) {
      quality = 'excellent';
    } else if (response.ok && responseTime < 3000) {
      quality = 'good';
    } else if (response.ok && responseTime < 8000) {
      quality = 'fair';
    } else if (response.ok) {
      quality = 'poor';
    } else {
      quality = 'unreachable';
    }

    validation.quality = quality;
    validation.recommendations = [];

    // Add recommendations based on analysis
    if (!response.ok) {
      validation.recommendations.push('Stream is not accessible - check URL and server status');
    }
    
    if (responseTime > 5000) {
      validation.recommendations.push('High response time - consider using CDN or closer server');
    }
    
    if (!validation.supportsRanges && validation.streamType !== 'HLS') {
      validation.recommendations.push('Range requests not supported - seeking may not work properly');
    }
    
    if (validation.streamType === 'HLS' && !validation.isLiveStream) {
      validation.recommendations.push('Consider using proxy endpoint for better HLS compatibility');
    }

    res.status(200).json(validation);
    
  } catch (error) {
    const validation = {
      url,
      accessible: false,
      error: error.message,
      responseTime: 'timeout',
      timestamp: new Date().toISOString()
    };

    if (error.name === 'AbortError') {
      validation.error = 'Request timeout - stream may be slow or unreachable';
      validation.recommendations = ['Check stream URL', 'Verify server is online', 'Consider timeout increase'];
    }

    res.status(200).json(validation);
  }
}
