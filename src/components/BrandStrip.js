import Link from 'next/link';

const BRANDS = [
  { name: 'Netflix', href: '/tvshows', color: '#E50914', bg: 'rgba(229, 9, 20, 0.1)' },
  { name: 'Prime', href: '/movies', color: '#00A8E1', bg: 'rgba(0, 168, 225, 0.1)' },
  { name: 'Disney+', href: '/movies', color: '#16D2FF', bg: 'rgba(22, 210, 255, 0.1)' },
  { name: 'AppleTV', href: '/tvshows', color: '#ffffff', bg: 'rgba(255, 255, 255, 0.1)' },
  { name: 'SonyLIV', href: '/movies', color: '#E50914', bg: 'rgba(229, 9, 20, 0.1)' },
  { name: 'Hotstar', href: '/movies', color: '#FFCC00', bg: 'rgba(255, 204, 0, 0.1)' },
];

export default function BrandStrip() {
  return (
    <div className="w-full pl-4 md:pl-[120px] 2xl:pl-[140px] pr-4 md:pr-14 mb-8">
      <div className="w-full bg-gradient-to-r from-[#1c1f26] to-[#16181f] backdrop-blur-2xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Top Channels</h3>
          </div>
          <span className="text-sm font-bold text-gray-500 hidden sm:inline uppercase tracking-widest">Premium Content</span>
        </div>

        <div className="flex flex-wrap gap-4 md:gap-5">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              style={{ '--brand-color': b.color, '--brand-bg': b.bg }}
              className="group relative px-6 py-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-500 overflow-hidden flex-1 min-w-[140px] text-center"
            >
              <div 
                className="absolute inset-x-0 bottom-0 h-1 transition-all duration-500 scale-x-0 group-hover:scale-x-100"
                style={{ backgroundColor: b.color }}
              />
              <span className="relative z-10 font-black text-lg text-white/80 group-hover:text-white transition-colors tracking-tight">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


