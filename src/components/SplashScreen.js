import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total animation time before fade out: 1 second
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // 0.5s for the exit transition to finish
    }, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Letters for staggered animation
  const brandName = "WATCHOTT".split("");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
        >
          {/* Subtle animated glowing background orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute max-w-full w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute max-w-full w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Staggered Text Animation */}
            <div className="flex space-x-1 md:space-x-3 mb-10 overflow-hidden px-4">
              {brandName.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1, 
                    type: "spring", 
                    damping: 12 
                  }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-wider"
                  style={{ textShadow: "0px 15px 30px rgba(0,0,0,0.8)" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Premium Glowing Loading Bar */}
            <div className="w-48 md:w-64 h-1 bg-gray-800/60 rounded-full overflow-hidden backdrop-blur-md">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut", delay: 0.4 }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-6 text-xs md:text-sm font-semibold tracking-[0.3em] text-gray-400 uppercase"
            >
              Premium Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

