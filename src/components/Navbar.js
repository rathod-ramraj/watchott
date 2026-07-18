import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Home, Tv, Film, User, MonitorPlay, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Scroll listener removed as it was empty and unused
  }, []);

  const navLinks = [
    { name: 'My Space', path: '/myspace', icon: User },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Home', path: '/', icon: Home },
    { name: 'TV Shows', path: '/tvshows', icon: Tv },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Live TV', path: '/livetv', icon: MonitorPlay },
    { name: 'Anime', path: '/anime', icon: Sparkles },
  ];

  return (
    <>
      {/* WATCHOTT / Hotstar Styled Sidebar - Centered & Transparent */}
      <motion.div
        className="fixed left-0 top-0 bottom-0 z-[100] hidden md:flex flex-col items-start transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: isHovered ? '280px' : '96px',
          background: isHovered
            ? 'linear-gradient(to right, #0f1014 0%, #0f1014 90%, transparent 100%)'
            : 'linear-gradient(to right, #0f1014 0%, transparent 100%)',
          backdropFilter: isHovered ? 'blur(20px)' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-start w-full py-12 h-full">

          {/* Spacer if needed, or simply remove */}

          {/* Centered Navigation Items */}
          <div className="flex-1 flex flex-col items-start justify-center w-full gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = router.pathname === link.path;

              return (
                <Link key={link.name} href={link.path}>
                  <div className={`relative group flex items-center w-full py-4 px-9 cursor-pointer transition-all duration-300 ${isActive ? 'text-white' : 'text-[#8f98b0] hover:text-white'}`}>

                    <div className={`shrink-0 transition-transform duration-500 ${isActive ? 'scale-125' : 'group-hover:scale-125'}`}>
                      <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={`ml-10 text-[18px] font-bold whitespace-nowrap tracking-wide ${isActive ? 'text-white' : ''}`}
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        layoutId="activeSideBarNav"
                        className="absolute left-0 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Help/Settings at bottom if needed, currently empty to keep vertical center clean */}
          <div className="h-20 shrink-0" />
        </div>
      </motion.div>

      {/* Dim Overlay - Appears when sidebar expanded */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[90] pointer-events-none"
          />
        )}
      </AnimatePresence>



      {/* Mobile Bottom Navigation - Floating App Look */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-[72px] bg-[#1a1c23]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] z-[120] flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {navLinks.slice(1, 6).map((link) => {
          const Icon = link.icon;
          const isActive = router.pathname === link.path;
          return (
            <Link key={link.name} href={link.path} className={`flex flex-col items-center justify-center gap-1.5 w-14 h-14 transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-[#8f98b0] hover:text-white'}`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{link.name.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
}
