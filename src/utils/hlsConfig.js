const Hls = require('hls.js');

// Export HLS configuration for server-side usage
module.exports = {
  Hls,
  getOptimalConfig: (isLive = false, lowLatency = false) => ({
    maxBufferLength: isLive ? (lowLatency ? 6 : 30) : 60,
    maxMaxBufferLength: isLive ? (lowLatency ? 60 : 600) : 1200,
    maxBufferSize: 60 * 1000 * 1000,
    maxBufferHole: 0.5,
    lowLatencyMode: lowLatency,
    backBufferLength: isLive ? 90 : 30,
    highBufferWatchdogPeriod: 2,
    nudgeOffset: 0.1,
    nudgeMaxOffset: 0.5,
    maxFragLookUpTolerance: 0.25,
    liveSyncDurationCount: lowLatency ? 1 : 3,
    liveMaxLatencyDurationCount: lowLatency ? 6 : Infinity,
    liveDurationInfinity: true,
    preferManagedMediaSource: true,
    enableWorker: true,
    debug: process.env.NODE_ENV === 'development',
  }),
  
  getErrorRecoveryStrategy: (errorType, retryCount) => {
    const maxRetries = {
      [Hls.ErrorTypes.NETWORK_ERROR]: 5,
      [Hls.ErrorTypes.MEDIA_ERROR]: 3,
      [Hls.ErrorTypes.KEY_SYSTEM_ERROR]: 2,
      [Hls.ErrorTypes.MUX_ERROR]: 2,
    };
    
    const maxRetriesForType = maxRetries[errorType] || 3;
    const shouldRetry = retryCount < maxRetriesForType;
    
    return {
      shouldRetry,
      delay: shouldRetry ? Math.min(1000 * Math.pow(2, retryCount), 10000) : 0,
      maxRetries: maxRetriesForType
    };
  }
};
