import { useState, useEffect } from 'react';
import { auth } from '@/utils/firebaseClient';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push('/myspace');
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Registration successful! You are now logged in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0b0f]">
      <Head>
        <title>{isLogin ? 'Sign In' : 'Create Account'} - WATCHOTT</title>
      </Head>

      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: 'url("https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-transparent to-[#0f1014]"></div>
      </div>

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }} 
         animate={{ opacity: 1, scale: 1, y: 0 }} 
         transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
         className="w-full max-w-[420px] z-10 px-6 sm:px-0"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <PlayCircle className="text-white w-8 h-8 ml-1" />
           </div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase italic">WATCHOTT</h1>
           <p className="text-gray-400 font-medium text-sm mt-1">
              Your gateway to endless entertainment
           </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-white mb-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </motion.h2>
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
              {message}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-semibold ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  className="w-full bg-black/40 text-white placeholder-gray-600 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-semibold ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  className="w-full bg-black/40 text-white placeholder-gray-600 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all rounded-xl font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
             <div className="flex-1 h-px bg-white/10"></div>
             <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">or</span>
             <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <p className="text-gray-400 text-center mt-8 text-sm font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
                setEmail('');
                setPassword('');
              }} 
              className="text-white hover:text-blue-400 font-bold transition-colors underline decoration-white/30 underline-offset-4 hover:decoration-blue-400"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


