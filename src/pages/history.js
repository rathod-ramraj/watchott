import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Play, Trash2, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/utils/firebaseClient';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, writeBatch } from 'firebase/firestore';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'history'), where('user_id', '==', user.uid), orderBy('updated_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
            const item = doc.data();
            return {
              id: item.media_id,
              title: item.title,
              name: item.title,
              poster_path: item.poster_path,
              media_type: item.media_type || 'movie',
              season: item.season,
              episode: item.episode
            };
        });
        setHistory(data);
      } else {
        const savedHistory = localStorage.getItem('premium_ott_history');
        if (savedHistory) {
          try { setHistory(JSON.parse(savedHistory)); } catch {}
        }
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'history'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } else {
       localStorage.removeItem('premium_ott_history');
    }
    setHistory([]);
  };

  const removeHistoryItem = async (id) => {
    const user = auth.currentUser;
    if (user) {
       const historyId = `${user.uid}_${id}`;
       await deleteDoc(doc(db, 'history', historyId));
    } else {
       const updated = history.filter(item => item.id != id);
       localStorage.setItem('premium_ott_history', JSON.stringify(updated));
    }
    setHistory(prev => prev.filter(item => item.id != id));
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white pt-20 pb-24 md:pl-[110px] lg:pl-[130px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Watch History - WATCHOTT</title>
      </Head>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50 block"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50 block"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
             <Link href="/myspace" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                 <ArrowLeft size={20} className="text-gray-300" />
             </Link>
             <div>
                <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Watch History</h1>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                   <Clock size={16} /> Look back at what you&apos;ve watched.
                </p>
             </div>
          </div>
          {history.length > 0 && (
             <button 
               onClick={clearHistory}
               className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors font-semibold shadow-lg"
             >
               <Trash2 size={18} /> Clear All
             </button>
          )}
        </div>

        {loading ? (
             <div className="flex justify-center items-center py-32">
                 <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             </div>
        ) : history.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
             >
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                     <Clock size={40} className="text-gray-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-3">No Watch History</h2>
                 <p className="text-gray-400 max-w-md mb-8">You haven&apos;t watched anything recently. Explore WATCHOTT to find your next favorite movie or show.</p>
                 <Link href="/" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                     Explore WATCHOTT
                 </Link>
             </motion.div>
        ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {history.map((item, idx) => {
                  const posterUrl = item.poster_path?.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`;
                  return (
                     <motion.div
                        key={`${item.id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group bg-gray-900 rounded-2xl overflow-hidden aspect-[2/3] shadow-lg border border-white/5"
                     >
                        <Image 
                          src={posterUrl} 
                          alt={item.title || item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"
                          width={500}
                          height={750}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                           <h3 className="text-white font-bold leading-tight mb-3 line-clamp-2">
                              {item.title || item.name}
                           </h3>
                           <div className="flex items-center gap-3">
                              <Link 
                                href={`/watch/${item.id}?type=${item.title ? 'movie' : 'tv'}`}
                                className="flex-grow flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors"
                              >
                                 <Play size={16} fill="currentColor" /> Play
                              </Link>
                              <button 
                                onClick={() => removeHistoryItem(item.id)}
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 flex items-center justify-center transition-colors border border-white/10 hover:border-red-500/30 shrink-0"
                                title="Remove from history"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  )
                })}
             </div>
        )}
      </div>
    </div>
  );
}
