import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { auth, db } from '@/utils/firebaseClient';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Trash2, 
  Video, 
  Image as ImageIcon, 
  Code, 
  Smartphone, 
  Globe,
  Plus,
  Zap,
  Radio
} from 'lucide-react';

export default function ManageAds() {
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({ title: '', type: 'image', content: '' });
  const [isAuthorized, setIsAuthorized] = useState(null);
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

  useEffect(() => {
    if (!isAuthorized) return;
    const fetchAds = async () => {
      try {
        const q = query(collection(db, 'ads'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedAds = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAds(fetchedAds);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetchAds();
  }, [isAuthorized]);

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!newAd.title || !newAd.content) return;
    
    const adData = {
      ...newAd,
      created_at: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'ads'), adData);
      setAds([{ id: docRef.id, ...adData }, ...ads]);
      setNewAd({ title: '', type: 'image', content: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to save ad. Ensure you have Firestore enabled in Firebase.');
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
      setAds(ads.filter(ad => ad.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'image': return <ImageIcon size={18} />;
      case 'video': return <Video size={18} />;
      case 'html': return <Code size={18} />;
      case 'admob': return <Smartphone size={18} />
      case 'adsterra': return <Globe size={18} />
      default: return <Target size={18} />;
    }
  };

  const getTypeStyles = (type) => {
    switch(type) {
      case 'image': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'video': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'html': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'admob': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'adsterra': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (isAuthorized === null) return <div className="min-h-screen bg-[#020202] flex items-center justify-center font-black text-indigo-500 animate-pulse uppercase tracking-[0.5em]">Syncing...</div>;

  return (
    <div className="min-h-screen bg-[#020202] text-[#fafafa] pt-24 pb-32 md:pl-[100px] lg:pl-[120px] font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Head><title>Ad Center | WATCHOTT Admin</title></Head>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-[1400px]">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Campaign Manager</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">Astra <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Broadcaster</span></h1>
            <p className="text-[#a0a0a0] max-w-xl text-lg font-medium leading-relaxed italic opacity-80">Orchestrate promotional signals across the player network.</p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-3xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/30"><Plus size={20} /></div>
                Init Campaign
              </h3>
              <form onSubmit={handleAddAd} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Identifier</label>
                  <input type="text" value={newAd.title} onChange={(e) => setNewAd({...newAd, title: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-semibold" placeholder="e.g., Summer X" required />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Vector Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['image', 'video', 'html', 'admob', 'adsterra'].map(type => (
                      <button key={type} type="button" onClick={() => setNewAd({...newAd, type})} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${newAd.type === type ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-gray-300'}`}>
                        {getTypeIcon(type)}
                        <span className="text-[8px] font-black tracking-widest uppercase mt-2">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Endpoint</label>
                   {(newAd.type === 'html' || newAd.type === 'adsterra') ? (
                     <textarea value={newAd.content} onChange={(e) => setNewAd({...newAd, content: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-indigo-500 transition-all min-h-[140px] font-mono text-[10px] leading-relaxed" placeholder="Paste binary script here..." required />
                   ) : (
                     <input type="text" value={newAd.content} onChange={(e) => setNewAd({...newAd, content: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-indigo-500 transition-all font-mono text-xs" placeholder="https://cdn.link/ad.mp4" required />
                   )}
                </div>
                <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-5 rounded-[1.5rem] transition-all text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] uppercase tracking-tighter">Authorize Broadcast</button>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4"><div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>Active Signals</h2>
              <div className="flex items-center gap-2"><span className="text-3xl font-black text-indigo-500">{ads.length}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Deployed</span></div>
            </div>
            <AnimatePresence mode="popLayout">
              {ads.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02] border border-white/10 border-dashed rounded-[2.5rem] py-32 text-center backdrop-blur-sm">
                  <Radio size={44} className="mx-auto mb-8 text-gray-700 transform rotate-12" />
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Silence Detected</h3>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.map((ad, idx) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }} key={ad.id} className="group relative">
                      <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:border-indigo-500/30 shadow-2xl relative z-10 flex flex-col h-full">
                        <div className="aspect-video bg-[#000] relative overflow-hidden flex items-center justify-center p-3">
                          {ad.type === 'video' ? <video src={ad.content} className="w-full h-full object-cover rounded-3xl" muted loop autoPlay playsInline /> : ad.type === 'image' ? (ad.content && <Image src={ad.content} className="w-full h-full object-cover rounded-3xl" alt={ad.title} width={480} height={270} />) : <div className="w-full h-full text-[10px] text-indigo-400/30 font-mono break-all line-clamp-10 bg-white/[0.02] p-6 rounded-3xl overflow-hidden italic border border-white/5">{ad.content}</div>}
                          <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border backdrop-blur-xl shadow-2xl ${getTypeStyles(ad.type)}`}>{getTypeIcon(ad.type)} {ad.type}</div>
                        </div>
                        <div className="p-8 flex items-center justify-between mt-auto">
                           <div><h3 className="font-black text-white text-xl uppercase tracking-tight truncate max-w-[200px]">{ad.title}</h3><div className="flex items-center gap-2 mt-2"><Zap size={10} className="text-indigo-500" /><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Link</p></div></div>
                           <button onClick={() => handleDeleteAd(ad.id)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 hover:bg-rose-500/80 rounded-2xl transition-all border border-transparent shadow-xl group/del"><Trash2 size={20} className="group-hover/del:scale-110 transition-transform" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
