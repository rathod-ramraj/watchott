import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - WATCHOTT</title>
      </Head>
      
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden bg-[#0f1014]">
        
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-[#0f1014] to-[#0f1014]" />

        <motion.div 
           initial={{ y: -50, opacity: 0 }} 
           animate={{ y: 0, opacity: 1 }} 
           transition={{ duration: 0.8 }}
           className="z-10 relative"
        >
          <h1 className="text-[120px] md:text-[150px] font-black leading-none text-white opacity-20">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-8 text-white">Lost your way?</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-lg mx-auto">
            Sorry, we can&apos;t find that page. You&apos;ll find loads to explore on the home page.
          </p>
          
          <Link href="/">
            <button className="px-10 py-4 btn-primary font-bold rounded-md text-lg text-white border border-white/20 transition-all duration-300">
              Home Page
            </button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}


