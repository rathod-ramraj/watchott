import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, AlertCircle, Radio } from 'lucide-react';
import HlsPlayer from '../components/HlsPlayer';

const REGIONS = [
  { code: 'all', name: 'All Regions' },
  { code: 'us', name: 'United States' },
  { code: 'in', name: 'India' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'int', name: 'International' },
];

export default function LiveTV() {
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);
  const [playerError, setPlayerError] = useState(false);
  const loadingRef = useRef(false);

  const fetchChannels = useCallback(async (pageNum, currentRegion, currentSearch) => {
    if (loadingRef.current && pageNum !== 1) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/channels?page=${pageNum}&limit=40&country=${currentRegion}&search=${currentSearch}`);
      const data = await res.json();
      const results = data.results || [];
      if (pageNum === 1) {
        setChannels(results);
      } else {
        setChannels(prev => [...prev, ...results]);
      }
      if (pageNum >= (data.total_pages || 1)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    }
    setLoading(false);
    loadingRef.current = false;
  }, []); // loadingRef is stable, so no loop.

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setChannels([]);
      setHasMore(true);
      fetchChannels(1, region, search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, region, fetchChannels]); // Added fetchChannels to dependencies

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextList = page + 1;
    setPage(nextList);
    fetchChannels(nextList, region, search);
  };

  const handlePlayChannel = (channel) => {
    setActiveChannel(channel);
    setPlayerError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] pt-16 pb-24 md:pl-[100px] lg:pl-[120px] font-sans selection:bg-red-500/30">
      <Head>
        <title>Live TV - WATCHOTT</title>
      </Head>

      {/* Subtle Background Glow */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#151520] to-transparent opacity-50 pointer-events-none z-0"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-[1600px] mt-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tight">
              Live TV <span className="flex items-center gap-2 text-red-500 text-sm font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Live</span>
            </h1>
            <p className="text-[#a0a0a0] mt-3 font-medium text-lg max-w-2xl">Broadcasts from around the globe. News, sports, entertainment, and more, streaming instantly.</p>
          </div>

          <div className="flex items-center bg-[#111111] border border-white/5 rounded-full px-4 py-2 hover:border-white/20 hover:bg-[#151515] transition-all w-full md:w-auto focus-within:border-gray-400 focus-within:bg-[#151515]">
            <Search className="text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-white outline-none w-full md:w-64 py-2 px-3 font-medium placeholder-gray-600 text-sm"
              placeholder="Search channels, networks..."
            />
          </div>
        </div>

        {/* Active Player Theater Mode */}
        <AnimatePresence>
          {activeChannel && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="w-full mb-12 origin-top overflow-hidden"
            >
              <div className="bg-[#0a0a0ca1] backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">

                {/* Video Player Area */}
                <div className="w-full lg:w-[70%] bg-[#000] relative aspect-video flex-shrink-0">
                  {playerError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-black/80 backdrop-blur-md p-8 text-center">
                      <AlertCircle size={56} className="mb-4 text-red-500" />
                      <h3 className="text-2xl font-bold mb-2 text-white">Playback Error</h3>
                      <p className="text-gray-400 max-w-sm mb-6 text-sm">This stream is currently offline, geo-blocked, or experiencing technical difficulties.</p>
                      <button onClick={() => setPlayerError(false)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors text-sm">Try Again</button>
                    </div>
                  ) : (
                    <HlsPlayer
                      src={`/api/proxy?url=${encodeURIComponent(activeChannel.url)}`}
                      poster={activeChannel.logo}
                      autoPlay={true}
                      isLive={true}
                      onError={() => setPlayerError(true)}
                    />
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Region Filters */}
        <div className={`transition-all duration-500 ${activeChannel ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}>
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-4 mb-4 hide-scrollbar scroll-smooth">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => setRegion(r.code)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all border ${region === r.code
                  ? 'bg-white text-black border-transparent shadow-[0_4px_14px_rgba(255,255,255,0.25)]'
                  : 'bg-[#111111] text-gray-400 border-white/5 hover:bg-[#1a1a1a] hover:text-white'
                  }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          {!channels.length && !loading ? (
            <div className="py-24 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Radio size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No channels found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">Try adjusting your region filter or search term to discover more channels.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
              {channels.map((channel, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx % 12) * 0.04 }}
                  key={channel.id}
                  onClick={() => handlePlayChannel(channel)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="w-full aspect-video bg-[#111111] border border-white/5 rounded-xl overflow-hidden relative mb-3 group-hover:border-white/20 transition-all duration-300 shadow-sm group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center p-6">
                    <Image
                      src={channel.logo}
                      onError={({ target }) => {
                        if (!target.src.includes('ui-avatars')) {
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || 'TV')}&background=random&color=fff&size=256&font-size=0.4`;
                        } else {
                          target.src = "https://upload.wikimedia.org/wikipedia/commons/4/41/Television_icon.png";
                        }
                      }}
                      alt={channel.name}
                      className="w-full h-full object-contain filter drop-shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      width={200}
                      height={112}
                      unoptimized // External dynamic logos
                    />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all duration-300">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <Play fill="currentColor" className="w-5 h-5 ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col px-1">
                    <h3 className="text-[#f0f0f0] group-hover:text-white font-semibold text-sm leading-tight line-clamp-1 truncate transition-colors">{channel.name}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate mr-2">{channel.category || 'General'}</span>
                      <span className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded uppercase">{channel.country}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {hasMore && !loading && channels.length > 0 && (
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-[#111] hover:bg-white text-gray-300 hover:text-black font-semibold rounded-full transition-all border border-white/10 hover:border-white shadow-sm text-sm"
              >
                Load More Channels
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


