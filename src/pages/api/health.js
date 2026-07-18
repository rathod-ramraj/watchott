// Health check and monitoring endpoints for streaming APIs

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Test basic API connectivity
    const apiTests = await Promise.allSettled([
      fetch('http://localhost:3000/api/channels?limit=1').then(r => r.json()),
      fetch('http://localhost:3000/api/proxy?url=https://httpbin.org/get').then(r => r.text())
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        channelsAPI: apiTests[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        proxyAPI: apiTests[1].status === 'fulfilled' ? 'healthy' : 'unhealthy'
      },
      details: {}
    };

    // Add error details if any tests failed
    if (apiTests[0].status === 'rejected') {
      results.details.channelsError = apiTests[0].reason.message;
    }
    if (apiTests[1].status === 'rejected') {
      results.details.proxyError = apiTests[1].reason.message;
    }

    // Add system info
    results.system = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.status(results.status === 'healthy' ? 200 : 503).json(results);
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
