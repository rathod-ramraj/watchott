import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white pt-20 pb-24 md:pl-[110px] lg:pl-[130px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Privacy Policy - WATCHOTT</title>
      </Head>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50 block"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50 block"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-8">
           <Link href="/myspace" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
               <ArrowLeft size={20} className="text-gray-300" />
           </Link>
           <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Privacy Policy</h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-emerald-400" /> Your privacy is our priority.
              </p>
           </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-lg prose prose-invert prose-indigo max-w-none">
           <p className="text-gray-300 leading-relaxed font-medium">
             Last Updated: October 26, 2023
           </p>

           <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
           <p className="text-gray-400 leading-relaxed mb-6">
             When you use WATCHOTT, we may collect information about you. This includes your email address when you register
             for an account, data about your interactions with the application, movies and shows you watch, and your search queries.
           </p>

           <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
           <p className="text-gray-400 leading-relaxed mb-6">
             We use the information we collect to operate, maintain, and provide the features of WATCHOTT. This includes
             personalizing your experience, providing recommendations based on your Watch History, and displaying
             content customized for you. We also use this information to communicate with you, such as sending updates 
             about service changes or new features.
           </p>

           <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Storage & Security</h2>
           <p className="text-gray-400 leading-relaxed mb-6">
             We take the security of your data seriously. Your Watch History and Watchlist are primarily stored 
             securely within Firebase Firestore. Account authentication is handled securely via Firebase Auth. While we implement 
             commercially reasonable safeguards to protect your personal information, please recognize that no method of 
             electronic transmission or storage is 100% secure.
           </p>

           <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Third-Party Services</h2>
           <p className="text-gray-400 leading-relaxed mb-6">
             WATCHOTT utilizes the TMDB (The Movie Database) API to fetch metadata, posters, and trailers for movies and 
             shows. By using WATCHOTT, you are also bound by TMDB&apos;s Terms of Service and Privacy Policy regarding the 
             media content displayed.
           </p>

           <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
           <p className="text-gray-400 leading-relaxed mb-6">
             If you have any questions or concerns about our Privacy Policy or data practices, please navigate to the Support 
             page and reach out to our team.
           </p>
        </div>
      </div>
    </div>
  );
}
