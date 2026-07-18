import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth } from '@/utils/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { Settings as SettingsIcon, Bell, Shield, Moon, Monitor, ArrowLeft, LogOut, Check } from 'lucide-react';

export default function Settings() {
  const [session, setSession] = useState(null);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user ? { user } : null);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white pt-20 pb-24 md:pl-[110px] lg:pl-[130px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Account Settings - WATCHOTT</title>
      </Head>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50 block"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50 block"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <Link href="/myspace" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <ArrowLeft size={20} className="text-gray-300" />
              </Link>
              <div>
                 <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Settings</h1>
                 <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <SettingsIcon size={16} /> Manage your account preferences.
                 </p>
              </div>
           </div>
           
           <button 
             onClick={handleSave}
             className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
           >
             {saved ? <><Check size={18} /> Saved!</> : 'Save Changes'}
           </button>
        </div>

        <div className="space-y-8">
           {/* Account Details */}
           <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <Shield className="text-indigo-400" /> Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={session?.user?.email || 'Not logged in'} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed focus:outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-left text-white transition-colors focus:outline-none">
                       Change Password...
                    </button>
                 </div>
              </div>
           </div>

           {/* Notifications */}
           <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <Bell className="text-indigo-400" /> Notifications
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="font-semibold text-gray-200">Email Notifications</h3>
                       <p className="text-sm text-gray-500">Receive updates, offers, and recommendations.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                       <h3 className="font-semibold text-gray-200">Push Notifications</h3>
                       <p className="text-sm text-gray-500">Get alerts on your device for new releases.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                 </div>
              </div>
           </div>

           {/* Appearance */}
           <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                 <Monitor className="text-indigo-400" /> Appearance
              </h2>
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setTheme('dark')}
                   className={`flex-1 py-4 flex flex-col items-center gap-2 rounded-xl border ${theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-400'} transition-all`}
                 >
                    <Moon size={24} />
                    <span className="font-medium">Dark Mode</span>
                 </button>
                 <button 
                   onClick={() => setTheme('light')}
                   className={`flex-1 py-4 flex flex-col items-center gap-2 rounded-xl border ${theme === 'light' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-400'} transition-all opacity-50 cursor-not-allowed`}
                   title="Coming soon"
                 >
                    <Monitor size={24} />
                    <span className="font-medium">Light Mode</span>
                 </button>
              </div>
           </div>
           
           {/* Danger Zone */}
           <div className="pt-8">
              <button className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-400 transition-colors">
                  <LogOut size={18} /> Delete Account
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
