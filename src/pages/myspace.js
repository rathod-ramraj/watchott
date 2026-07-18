import { useState, useEffect } from 'react';
import { auth } from '@/utils/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Bookmark, 
  History, 
  PlayCircle,
  Film,
  MonitorPlay
} from 'lucide-react';
import Link from 'next/link';

export default function MySpace() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user ? { user } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const MENU_ITEMS = [
    { name: 'My Watchlist', icon: Bookmark, description: 'Shows and movies you saved', path: '/mylist' },
    { name: 'Watch History', icon: History, description: 'Pick up where you left off', path: '/history' },
    { name: 'Help & Support', icon: HelpCircle, description: 'FAQs and customer support', path: '/support' },
    { name: 'Account Settings', icon: Settings, description: 'Update profile and preferences', path: '/settings' },
    { name: 'Privacy & Security', icon: ShieldAlert, description: 'Data, security and privacy policies', path: '/privacy' },
  ];

  const getInitial = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0f1014] pb-24 md:pb-0 relative overflow-hidden text-white">
      <Head>
        <title>My Space - WATCHOTT</title>
      </Head>

      {/* Futuristic Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#0000ff]/10 blur-[150px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-6 md:pl-[120px] lg:pl-[140px] lg:pr-12 pt-16 md:pt-28 min-h-screen relative z-10">
         <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-14"
         >
            
            {/* Left Column: Profile Card */}
            <div className="lg:w-1/3 flex flex-col gap-6">
               <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center justify-center text-center flex-1">
                  <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent -z-10"></div>
                  
                  {loading ? (
                    <div className="w-full flex justify-center py-20">
                      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <div className="w-28 h-28 bg-gradient-to-br from-indigo-400 to-rose-500 p-[3px] rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6">
                         <div className="w-full h-full bg-[#0a0b0f] rounded-full flex items-center justify-center overflow-hidden">
                            {session ? (
                                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-rose-300">
                                    {getInitial(session.user?.email)}
                                </span>
                            ) : (
                                <PlayCircle className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
                            )}
                         </div>
                      </div>
                      
                      <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                        {session ? 'Welcome back!' : 'Sign in to WATCHOTT'}
                      </h1>
                      <p className="text-sm text-gray-400 leading-relaxed mb-8">
                        {session 
                          ? `${session.user?.email || 'User'}` 
                          : 'Unlock endless entertainment. Start watching from where you left off.'}
                      </p>

                      {!session && (
                          <Link 
                              href="/login"
                              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 transition-all duration-300 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-[0.98]"
                          >
                              Sign In Now
                          </Link>
                      )}
                      {session && (
                          <button 
                            onClick={async () => {
                              try {
                                await signOut(auth);
                                router.push('/login');
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="w-full flex justify-center items-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 group text-red-400 font-bold"
                          >
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Sign Out
                          </button>
                      )}
                    </>
                  )}
               </div>


            </div>

            {/* Right Column: Menu Grid */}
            <div className="lg:w-2/3 flex flex-col gap-4">
               {[
                 ...MENU_ITEMS,
                 ...(session?.user?.email === 'gaurav1000m@gmail.com' ? [
                   { name: 'Admin: Movie Manager', icon: Film, description: 'Manage custom servers & sources', path: '/manage-movies' },
                   { name: 'Admin: Manage Ads', icon: MonitorPlay, description: 'Configure AdMob, Adsterra & custom ads', path: '/manage-ads' },
                 ] : [])
               ].map((item, idx) => {
                 const Icon = item.icon;
                 return (
                   <motion.div
                     key={item.name} 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.1 + (idx * 0.08), ease: "easeOut" }}
                     className="w-full"
                   >
                     <Link href={item.path} className="w-full flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/30 backdrop-blur-md rounded-2xl transition-all duration-300 group shadow-lg cursor-pointer">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.05] group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center transition-all duration-300">
                             <Icon size={22} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="text-left">
                             <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors tracking-tight">{item.name}</h3>
                             <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-indigo-500 transition-colors duration-300">
                           <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-all" />
                        </div>
                     </Link>
                   </motion.div>
                 )
               })}
            </div>
            
         </motion.div>
      </div>
    </div>
  );
}

