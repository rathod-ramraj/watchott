import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Smile, 
  Ghost, 
  Heart, 
  Rocket, 
  Compass, 
  Sword, 
  Theater,
  Film
} from 'lucide-react';

const CATEGORIES = [
  { id: 28, name: 'Action', icon: Sword, color: 'from-red-600 to-orange-600' },
  { id: 35, name: 'Comedy', icon: Smile, color: 'from-yellow-400 to-amber-600' },
  { id: 27, name: 'Horror', icon: Ghost, color: 'from-purple-900 to-indigo-950' },
  { id: 10749, name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { id: 878, name: 'Sci-Fi', icon: Rocket, color: 'from-blue-600 to-cyan-500' },
  { id: 12, name: 'Adventure', icon: Compass, color: 'from-emerald-500 to-teal-700' },
  { id: 16, name: 'Animation', icon: Zap, color: 'from-orange-400 to-pink-500' },
  { id: 18, name: 'Drama', icon: Theater, color: 'from-slate-700 to-slate-900' },
];

export default function CategoriesGrid() {
  return (
    <div className="w-full px-4 md:px-12 lg:px-16 py-10">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Browse by Category <Film size={24} className="text-blue-500" />
            </h2>
        </div>
        <Link href="/movies" className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors tracking-widest uppercase">
          View All Genres
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {CATEGORIES.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative"
            >
              <Link href={`/movies?genre=${cat.id}`}>
                <div className={`relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]`}>
                  
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Animated Pattern / Texture */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
                    <svg width="100%" height="100%">
                      <pattern id={`pattern-${cat.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#pattern-${cat.id})`} />
                    </svg>
                  </div>

                  {/* Icon & Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="mb-3 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 bg-black/20 backdrop-blur-md p-4 rounded-full border border-white/10 group-hover:bg-white/20">
                      <Icon size={32} className="text-white drop-shadow-lg" />
                    </div>
                    <span className="text-white text-sm md:text-base font-black tracking-wider uppercase group-hover:tracking-widest transition-all duration-300 pointer-events-none drop-shadow-md">
                      {cat.name}
                    </span>
                  </div>

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
