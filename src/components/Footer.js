import Link from 'next/link';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f1014] pt-16 pb-24 md:pb-8 md:pl-[90px] border-t border-[#2b3040] mt-20 relative z-10">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-400">
        
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center border border-gray-600">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-white">Premium</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            The ultimate cinematic streaming experience. Enjoy thousands of movies and TV shows instantly.
          </p>
          <div className="flex items-center gap-4 mt-4 text-white">
            <a href="#" className="hover:text-gray-300 hover:scale-110 transition-all"><Facebook size={20} /></a>
            <a href="#" className="hover:text-gray-300 hover:scale-110 transition-all"><Twitter size={20} /></a>
            <a href="#" className="hover:text-gray-300 hover:scale-110 transition-all"><Instagram size={20} /></a>
            <a href="#" className="hover:text-gray-300 hover:scale-110 transition-all"><Youtube size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-gray-300 font-semibold mb-6">Navigation</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/movies" className="hover:text-white transition-colors">Movies</Link></li>
            <li><Link href="/tvshows" className="hover:text-white transition-colors">TV Shows</Link></li>
            <li><Link href="/search" className="hover:text-white transition-colors">Search</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-semibold mb-6">Support</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Account Setup</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Supported Devices</a></li>
          </ul>
        </div>

        <div>
           <h4 className="text-gray-300 font-semibold mb-6">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Corporate Information</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-gray-500 container mx-auto px-6">
        © {new Date().getFullYear()} WATCHOTT Clone. Inspired by JioHotstar & Netflix. Powered by TMDB & Next.js.
      </div>
    </footer>
  );
}

