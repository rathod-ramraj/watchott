export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ ok: false, error: 'URL is required' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(200).json({ ok: false, reason: `HTTP ${response.status}`, status: response.status });
    }

    const html = await response.text();

    const missingTriggers = [
      'This media is unavailable at the moment.',
      'Movie not found',
      'Episode not found',
      'Media not found',
      '404 Not Found',
      'File was deleted',
      'Video has been restricted',
      'This video is not available',
      'No player found',
      'Streaming server error'
    ];

    for (const trigger of missingTriggers) {
      if (html.toLowerCase().includes(trigger.toLowerCase())) {
        return res.status(200).json({ ok: false, reason: `Media Unavailable: ${trigger}` });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return res.status(200).json({ ok: false, reason: isTimeout ? 'Connection Timeout (10s)' : err.message });
  }
}
