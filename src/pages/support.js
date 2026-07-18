import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Mail, Phone, ArrowLeft } from 'lucide-react';

const FAQS = [
  {
    question: "How do I reset my password?",
    answer: "To reset your password, simply click on the 'Forgot Password' link on the sign-in page, enter your registered email address, and follow the link sent to your inbox."
  },
  {
    question: "Can I download movies for offline viewing?",
    answer: "Currently, WATCHOTT is a streaming-only platform. You need an active internet connection to watch our vast library of movies and shows."
  },
  {
    question: "Are there any subscription fees?",
    answer: "WATCHOTT provides free ad-supported streaming as well as premium ad-free tiers. Check our upgrade page for more details on premium plans."
  },
  {
    question: "How do I add a show to my Watchlist?",
    answer: "When you are on a movie or show's detail page, simply click the '+ Watchlist' button below the title to save it for later viewing."
  },
  {
    question: "What devices are supported?",
    answer: "WATCHOTT is accessible across all modern web browsers, smartphones, tablets, and smart TVs via our responsive web platform."
  }
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white pt-20 pb-24 md:pl-[110px] lg:pl-[130px] font-sans selection:bg-indigo-500/30">
      <Head>
        <title>Support & FAQ - WATCHOTT</title>
      </Head>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50 block"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50 block"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl">
        <div className="flex items-center gap-4 mb-10">
           <Link href="/myspace" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
               <ArrowLeft size={20} className="text-gray-300" />
           </Link>
           <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">Help & Support</h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                 <HelpCircle size={16} /> How can we assist you today?
              </p>
           </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center shadow-lg group hover:bg-white/[0.04] transition-all cursor-pointer">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                  <MessageCircle size={28} />
              </div>
              <h3 className="font-bold text-lg mb-1 tracking-tight text-white">Live Chat</h3>
              <p className="text-sm text-gray-400">Usually responds in minutes</p>
           </motion.div>
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center shadow-lg group hover:bg-white/[0.04] transition-all cursor-pointer">
              <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
                  <Mail size={28} />
              </div>
              <h3 className="font-bold text-lg mb-1 tracking-tight text-white">Email Support</h3>
              <p className="text-sm text-gray-400">support@WATCHOTT.com</p>
           </motion.div>
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center shadow-lg group hover:bg-white/[0.04] transition-all cursor-pointer">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <Phone size={28} />
              </div>
              <h3 className="font-bold text-lg mb-1 tracking-tight text-white">Call Us</h3>
              <p className="text-sm text-gray-400">+1 (800) WATCHOTT</p>
           </motion.div>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-black text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
           {FAQS.map((faq, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (idx * 0.1) }}
               className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md"
             >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
                >
                   <span className="font-semibold text-lg text-gray-200">{faq.question}</span>
                   <ChevronDown 
                     size={20} 
                     className={`text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-indigo-400' : ''}`}
                   />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 border-t border-white/5"
                    >
                       <p className="py-5 text-gray-400 leading-relaxed font-medium">
                          {faq.answer}
                       </p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
           ))}
        </div>

      </div>
    </div>
  );
}
