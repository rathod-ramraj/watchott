import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize, Minimize, Smartphone } from 'lucide-react';

class FetchLoader {
  constructor(config) {
    this.config = config;
    this.stats = { trequest: 0, tfirst: 0, tload: 0, loaded: 0, mtime: 0 };
    this.context = null;
    this.callbacks = null;
    this.abortController = null;
  }

  load(context, config, callbacks) {
    this.context = context;
    this.callbacks = callbacks;
    this.abortController = new AbortController();
    this.stats.trequest = performance.now();

    fetch(context.url, {
      method: 'GET',
      headers: context.headers || {},
      signal: this.abortController.signal,
      cache: 'no-store'
    })
    .then(async (res) => {
      this.stats.tfirst = Math.max(performance.now(), this.stats.trequest);
      
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      let data;
      if (context.responseType === 'arraybuffer') {
        data = await res.arrayBuffer();
      } else {
        data = await res.text();
      }

      this.stats.tload = Math.max(this.stats.tfirst, performance.now());
      this.stats.loaded = data.byteLength || data.length || 0;

      callbacks.onSuccess({ url: res.url, data }, this.stats, context, res);
    })
    .catch((error) => {
      if (error.name === 'AbortError') return;
      callbacks.onError({ code: 0, text: error.message }, context, this.stats);
    });
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  destroy() {
    this.abort();
    this.callbacks = null;
    this.context = null;
  }
}

export default function HlsPlayer({ src, poster, autoPlay = true, className = "", onError, isLive = true }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryCount = useRef(0);
  const loadTimeoutRef = useRef(null);
  const manifestReloadRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOrientationLocked, setIsOrientationLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Screen orientation handling for mobile
  const lockOrientation = async () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
        setIsOrientationLocked(true);
      }
    } catch (err) {
      console.log('Orientation lock not supported:', err);
    }
  };

  const unlockOrientation = async () => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        await screen.orientation.unlock();
        setIsOrientationLocked(false);
      }
    } catch (err) {
      console.log('Orientation unlock not supported:', err);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
        await lockOrientation();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        await unlockOrientation();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        unlockOrientation();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initPlayer = () => {
      // Clean up previous HLS instance if any
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Clear any existing timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (manifestReloadRef.current) {
        clearInterval(manifestReloadRef.current);
      }

      // Reset retry count on new source
      retryCount.current = 0;

      if (Hls.isSupported()) {
        // Enhanced HLS configuration optimized for LIVE streaming
        const hls = new Hls({
          // Live streaming specific settings
          maxBufferLength: isLive ? 15 : 30,
          maxMaxBufferLength: isLive ? 30 : 60,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.3,
          lowLatencyMode: false,
          backBufferLength: isLive ? 30 : 90,
          
          // Live sync settings - critical for continuous streaming
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          liveDurationInfinity: true,
          
          // Better error recovery
          highBufferWatchdogPeriod: 1,
          nudgeOffset: 0.1,
          nudgeMaxOffset: 1,
          maxFragLookUpTolerance: 0.5,
          
          // Use custom fetch loader to bypass Chrome Extension XHR bugs
          pLoader: FetchLoader,
          fLoader: FetchLoader,
          
          // Enable worker for better performance
          enableWorker: true,
          
          // Manifest loading - critical for live streams
          manifestLoadingTimeOut: 20000,
          manifestLoadingMaxRetry: 5,
          manifestLoadingRetryDelay: 1000,
          
          // Level/Fragment loading
          levelLoadingTimeOut: 20000,
          levelLoadingMaxRetry: 5,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 5,
          
          debug: false,
        });

        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);
        
        // Force live tracking
        if (isLive) {
          hls.config.liveBackBufferLength = 0;
        }
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('Manifest parsed, levels:', data.levels.length);
          if (autoPlay) {
            video.play().catch(e => console.log("Auto-play prevented", e));
          }
          
          if (isLive) {
            manifestReloadRef.current = setInterval(() => {
              if (hlsRef.current) {
                try { hlsRef.current.startLoad(); } catch {}
              }
            }, 5000); // Check every 5 seconds
          }
        });

        // Handle level switching for better quality adaptation
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log('Quality level switched to:', data.level);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS Error:', data.type, data.details, 'Fatal:', data.fatal);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCount.current < 8) {
                   retryCount.current += 1;
                   
                   // Clear any existing timeout
                   if (loadTimeoutRef.current) {
                     clearTimeout(loadTimeoutRef.current);
                   }
                   
                   // Exponential backoff with shorter delays for live
                   const delay = Math.min(1000 * Math.pow(1.5, retryCount.current - 1), 5000);
                   loadTimeoutRef.current = setTimeout(() => {
                     if (hlsRef.current) {
                       try { hlsRef.current.startLoad(); } catch {}
                     }
                   }, delay);
                } else {
                   try { hls.destroy(); } catch {}
                   if (onError) onError({ ...data, retriesExhausted: true });
                }
                break;
                
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Fatal media error encountered, try to recover", data);
                if (retryCount.current < 5) {
                  retryCount.current += 1;
                  try { hls.recoverMediaError(); } catch {}
                  // Also try to swap audio codec if recovery fails
                  setTimeout(() => {
                    if (hlsRef.current) {
                      try {
                        hls.swapAudioCodec();
                        hls.recoverMediaError();
                      } catch {}
                    }
                  }, 1000);
                } else {
                  try { hls.destroy(); } catch {}
                  if (onError) onError({ ...data, retriesExhausted: true });
                }
                break;
                
              default:
                try { hls.destroy(); } catch {}
                if (onError) onError(data);
                break;
            }
          } else {
            // Non-fatal errors - handle specific ones
            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
              if (hlsRef.current) {
                try { hlsRef.current.startLoad(); } catch {}
              }
            } else if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
              console.warn("Fragment load error, will retry");
            }
          }
        });

        // Monitor buffer health for live streams
        if (isLive) {
          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            const buffered = video.buffered;
            if (buffered.length > 0) {
              const bufferEnd = buffered.end(buffered.length - 1);
              const currentTime = video.currentTime;
              const bufferAhead = bufferEnd - currentTime;
              
              if (bufferAhead < 2) {
                try { hls.startLoad(); } catch {}
              }
            }
          });
        }

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) {
            video.play().catch(e => console.log("Auto-play prevented", e));
          }
        });
        video.addEventListener('error', (e) => {
          if (onError) onError(e);
        });
      } else {
        console.error("HLS is not supported in this browser.");
        if (onError) onError("HLS Not Supported");
      }
    };

    initPlayer();

    return () => {
      // Clear all timeouts and intervals
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (manifestReloadRef.current) {
        clearInterval(manifestReloadRef.current);
      }
      
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch {}
        hlsRef.current = null;
      }
      
      // Unlock orientation on unmount
      unlockOrientation();
    };
  }, [src, autoPlay, onError, isLive]);

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        className={`w-full h-full object-contain bg-black ${className}`}
        controls
        playsInline
        poster={poster}
        preload="auto"
      />
      
      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="flex items-center justify-end gap-2">
          {/* Orientation Lock Button (Mobile) */}
          <button
            onClick={isOrientationLocked ? unlockOrientation : lockOrientation}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors md:hidden"
            title={isOrientationLocked ? "Unlock Rotation" : "Lock to Landscape"}
          >
            <Smartphone size={18} className={isOrientationLocked ? 'text-green-400' : ''} />
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
      
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-full text-white text-xs font-bold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      )}
    </div>
  );
}

