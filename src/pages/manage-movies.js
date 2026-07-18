import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { auth, db } from '@/utils/firebaseClient';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Search, 
  Film, 
  Star,
  Settings,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  Zap,
  Play,
  Server,
  Code,
  PlayCircle,
  PlusCircle
} from 'lucide-react';
import { searchContent, getMovieDetails } from '@/services/tmdb';

export default function ManageMovies() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [newSource, setNewSource] = useState({ 
    title: '', 
    source_type: 'server', 
    url: '', 
    embed_code: '' 
  });
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.email !== 'gaurav1000m@gmail.com') {
        router.replace('/');
      } else {
        setIsAuthorized(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSources = async (tmdbId, mediaType) => {
    const q = query(
      collection(db, 'movie_sources'),
      where('tmdb_id', '==', tmdbId.toString()),
      where('media_type', '==', mediaType),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const fetchedSources = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setSources(fetchedSources);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchContent(searchQuery);
      setSearchResults(results.filter(r => r.media_type === 'movie' || r.media_type === 'tv'));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectMovie = async (movie) => {
    setLoading(true);
    const details = await getMovieDetails(movie.id, movie.media_type);
    setSelectedMovie({ ...details, media_type: movie.media_type });
    await fetchSources(movie.id, movie.media_type);
    setLoading(false);
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !newSource.title) return;

    const sourceData = {
      tmdb_id: selectedMovie.id.toString(),
      media_type: selectedMovie.media_type,
      title: newSource.title,
      source_type: newSource.source_type,
      url: newSource.url,
      embed_code: newSource.embed_code,
      poster_path: selectedMovie.poster_path,
      movie_title: selectedMovie.title || selectedMovie.name,
      created_at: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'movie_sources'), sourceData);
      setSources([{ id: docRef.id, ...sourceData }, ...sources]);
      setNewSource({ title: '', source_type: 'server', url: '', embed_code: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to save source. Ensure you have Firestore enabled in Firebase.');
    }
  };

  const handleDeleteSource = async (id) => {
    try {
      await deleteDoc(doc(db, 'movie_sources', id));
      setSources(sources.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const getSourceTypeStyles = (type) => {
    switch(type) {
      case 'server': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'external': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'direct': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'embed': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getSourceIcon = (type) => {
    switch(type) {
      case 'server': return <Layers size={16} />;
      case 'external': return <ExternalLink size={16} />;
      case 'direct': return <Play size={16} />;
      case 'embed': return <Zap size={16} />;
      default: return <Settings size={16} />;
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-[#fafafa] pt-24 pb-32 md:pl-[100px] lg:pl-[120px] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Head>
        <title>Manage Sources | WATCHOTT Admin</title>
      </Head>

      {/* Futuristic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-[1400px]">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Admin Panel</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Forge</span>
            </h1>
            <p className="text-[#a0a0a0] max-w-xl text-lg font-medium leading-relaxed">
              Craft ultimate streaming experiences by forging custom links for global cinematic masterpieces.
            </p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSearch} 
            className="relative w-full lg:w-[450px]"
          >
            <div className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a masterpiece to manage..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={24} />
            </div>
          </motion.form>
        </header>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: Search & Selection */}
          <div className="lg:col-span-4 space-y-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center backdrop-blur-xl"
                >
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Scanning TMDB Database</p>
                </motion.div>
              ) : selectedMovie ? (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="selected"
                  className="relative group group/card"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl shadow-2xl relative z-10">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <Image 
                        src={`https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={selectedMovie.title || selectedMovie.name}
                        width={500}
                        height={750}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/20 to-transparent"></div>
                      <button 
                        onClick={() => setSelectedMovie(null)}
                        className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl text-white p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group/btn"
                      >
                        <Settings size={20} className="group-hover/btn:rotate-90 transition-transform" />
                      </button>
                    </div>
                    
                    <div className="p-8 -mt-20 relative z-10">
                      <div className="flex flex-wrap gap-2 mb-4">
                         <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg tracking-tighter shadow-lg shadow-indigo-500/40">
                           {selectedMovie.media_type}
                         </span>
                         <span className="px-4 py-1.5 bg-white/10 text-gray-200 text-[10px] font-black uppercase rounded-lg tracking-tighter border border-white/10 backdrop-blur-md">
                           {selectedMovie.release_date?.slice(0, 4) || selectedMovie.first_air_date?.slice(0, 4)}
                         </span>
                         <span className="px-4 py-1.5 bg-white/10 text-gray-200 text-[10px] font-black uppercase rounded-lg tracking-tighter border border-white/10 backdrop-blur-md">
                           <Star size={10} className="inline mr-1" /> {selectedMovie.vote_average?.toFixed(1)}
                         </span>
                      </div>
                      <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight uppercase">
                        {selectedMovie.title || selectedMovie.name}
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 font-medium italic opacity-80">
                        &quot;{selectedMovie.overview}&quot;
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : searchResults.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide custom-scrollbar"
                >
                  <div className="flex items-center justify-between px-2 mb-2">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Query Results</p>
                    <span className="text-[10px] font-bold text-gray-500">{searchResults.length} Found</span>
                  </div>
                  {searchResults.map((result, idx) => (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${result.media_type}-${result.id}`}
                      onClick={() => selectMovie(result)}
                      className="w-full flex items-center gap-5 p-4 bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 rounded-3xl text-left transition-all group relative overflow-hidden"
                    >
                      <div className="w-16 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-gray-900 shadow-xl border border-white/10 relative z-10">
                        <Image 
                          src={result.poster_path ? `https://image.tmdb.org/t/p/w185${result.poster_path}` : '/placeholder.jpg'} 
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                          alt={result.title || result.name || ""}
                          width={185}
                          height={278}
                        />
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${result.media_type === 'tv' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{result.media_type}</span>
                        </div>
                        <h4 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {result.title || result.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          {result.release_date?.slice(0, 4) || result.first_air_date?.slice(0, 4)}
                        </p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ArrowRight size={18} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/[0.02] border border-white/10 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center backdrop-blur-md"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-white/10 relative z-10 transform rotate-12 transition-transform hover:rotate-0 duration-500 shadow-2xl">
                      <Search size={44} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Launch Sync</h3>
                  <p className="text-gray-500 text-sm max-w-[280px] font-medium leading-relaxed">
                    Search for a title to initiate the link mapping protocol.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Sources Management */}
          <div className="lg:col-span-8 space-y-12">
            <AnimatePresence mode="wait">
              {selectedMovie ? (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* MODERN FORM */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-3xl shadow-3xl">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/30">
                            <Plus size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Forge New Path</h3>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <Settings size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol 3-D</span>
                        </div>
                      </div>
                      
                      <form onSubmit={handleAddSource} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Source Label</label>
                            <input 
                              type="text"
                              value={newSource.title}
                              onChange={(e) => setNewSource({...newSource, title: e.target.value})}
                              placeholder="e.g., &quot;The Dark Knight&quot; or &quot;Inception&quot;"
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base font-semibold"
                              required
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Mapping Type</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {[
                                { id: 'server', label: 'SRV', icon: <Server size={14} /> },
                                { id: 'external', label: 'EXT', icon: <ExternalLink size={14} /> },
                                { id: 'embed', label: 'CODE', icon: <Code size={14} /> },
                                { id: 'direct', label: 'LIVE', icon: <PlayCircle size={14} /> }
                              ].map(t => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setNewSource({...newSource, source_type: t.id})}
                                  className={`flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl transition-all border group/btn ${newSource.source_type === t.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)]' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'}`}
                                >
                                  {t.icon}
                                  <span className="text-[8px] font-black tracking-widest uppercase">{t.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                            {newSource.source_type === 'embed' ? 'Terminal Code' : 'Stream Coordinates (URL)'}
                          </label>
                          {newSource.source_type === 'embed' ? (
                            <textarea 
                              value={newSource.embed_code}
                              onChange={(e) => setNewSource({...newSource, embed_code: e.target.value})}
                              placeholder="<iframe src='...' ></iframe>"
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[140px] font-mono text-sm leading-relaxed"
                              required
                            />
                          ) : (
                            <input 
                              type="url"
                              value={newSource.url}
                              onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                              placeholder={newSource.source_type === 'direct' ? "https://stream.m3u8" : "https://embed.coordinate/path"}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                              required
                            />
                          )}
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-[0.98] uppercase tracking-tighter"
                        >
                          <PlusCircle size={24} /> Forge Link for {selectedMovie.media_type === 'movie' ? 'Cinema' : 'Series'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* ACTIVE PATHS LIST */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        Active Data Streams
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-indigo-500">{sources.length}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Live</span>
                      </div>
                    </div>
                    
                    {sources.length === 0 ? (
                      <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[2.5rem] py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                          <Info size={32} />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active streams detected.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5">
                        {sources.map((source, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={source.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all hover:border-indigo-500/30 shadow-xl"
                          >
                            <div className="flex items-center gap-6">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${getSourceTypeStyles(source.source_type)}`}>
                                 {getSourceIcon(source.source_type)}
                               </div>
                               <div className="space-y-1">
                                 <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                   {source.title}
                                   <div className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getSourceTypeStyles(source.source_type)}`}>
                                     {source.source_type}
                                   </div>
                                 </h4>
                                 <p className="text-xs text-indigo-400/50 truncate max-w-[200px] md:max-w-[400px] font-mono leading-none">
                                   {source.source_type === 'embed' ? '/// SOURCE PROTECTED ///' : source.url}
                                 </p>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleDeleteSource(source.id)}
                                className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 hover:bg-rose-500/80 rounded-2xl transition-all border border-transparent hover:shadow-[0_10px_20px_rgba(244,63,94,0.3)] group/del"
                                title="Terminate Stream"
                              >
                                <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center min-h-[500px]">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-center space-y-8 opacity-30"
                  >
                    <div className="w-24 h-24 border-2 border-white/20 border-dashed rounded-[2.5rem] flex items-center justify-center mx-auto transform rotate-45">
                      <Film size={44} className="-rotate-45" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-xs mx-auto">Awaiting Master Coordination Input</p>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
