import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { auth, db } from '@/utils/firebaseClient';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import Head from 'next/head';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const EXTERNAL_SITES = {
  'anime-world': {
    name: 'Anime World',
    url: 'https://watchanimeworld.net/'
  },
  'anime-salt': {
    name: 'Anime Salt',
    url: 'https://animesalt.ac/'
  }
};

function AdMobAd({ content }) {
  const adClient = (content || '').split('/')[0]?.replace('ca-app-pub', 'ca-pub') || '';
  const adSlot = (content || '').split('/')[1] || '';
  const containerRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoaded.current) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.width = '100%';
    ins.style.height = '100%';
    ins.setAttribute('data-ad-client', adClient);
    ins.setAttribute('data-ad-slot', adSlot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    
    container.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (e) {
      console.error('AdSense injection error:', e);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      isLoaded.current = false;
    };
  }, [adClient, adSlot]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden" ref={containerRef}>
      <Script
        id={`adsbygoogle-script-${adSlot}`}
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  );
}

function RawHtmlAd({ html }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const fullHtml = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#050505;display:flex;justify-content:center;align-items:center;}ins{min-width:100%;min-height:100%;}</style></head><body>${html}</body></html>`;
        iframeRef.current.contentWindow.postMessage({ html: fullHtml }, '*');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [html]);

  return (
    <iframe 
      ref={iframeRef}
      src="/ad.html"
      className="w-full h-full border-none bg-[#050505]"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"
    />
  );
}

export default function ExternalSite() {
  const router = useRouter();
  const { id } = router.query;
  
  const [showAd, setShowAd] = useState(true);
  const [adTimer, setAdTimer] = useState(30);
  const [currentAds, setCurrentAds] = useState([]);
  
  const site = EXTERNAL_SITES[id];

  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setShowAd(true);
    setAdTimer(30);
  }

  useEffect(() => {
    if (!id) return;

    const fetchAds = async () => {
      try {
        const user = auth.currentUser;
        if (user?.email === 'gaurav1000m@gmail.com') {
          setShowAd(false);
          return;
        }
        const q = query(collection(db, 'ads'), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (data && data.length > 0) {
          setCurrentAds(data.slice(0, 4));
        } else {
          // No active campaigns found, skip to the actual external site
          setShowAd(false);
        }
      } catch {
        setShowAd(false);
      }
    };
    fetchAds();
  }, [id]);

  useEffect(() => {
    let interval;
    if (showAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (adTimer === 0) {
      // eslint-disable-next-line
      setShowAd(false);
    }
    return () => clearInterval(interval);
  }, [showAd, adTimer]);

  if (!id || !site) {
    return (
       <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
         <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] md:pl-[90px] w-full relative">
      <Head>
        <title>{site.name} - WATCHOTT</title>
      </Head>

      {showAd ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full h-screen flex flex-col items-center justify-center relative bg-black/50"
        >
           <div className="w-full h-full max-w-6xl max-h-[80vh] bg-[#050505] border border-white/10 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center mx-4 rounded-xl">
             {/* Dynamic Ads Display */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {currentAds.length > 0 ? (
                 <div className={`w-full h-full grid gap-[2px] ${currentAds.length === 1 ? 'grid-cols-1' : currentAds.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}`}>
                   {currentAds.map(ad => (
                     <div key={ad.id} className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden pointer-events-auto">
                       {ad.type === 'video' ? (
                         <video src={ad.content} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                       ) : ad.type === 'image' ? (
                         <Image src={ad.content} fill className="object-cover" alt={ad.title || "Ad Image"} unoptimized />
                       ) : ad.type === 'admob' ? (
                         <AdMobAd content={ad.content} />
                       ) : ad.type === 'adsterra' ? (
                         <RawHtmlAd html={ad.content} />
                       ) : (
                         <RawHtmlAd html={ad.content} />
                       )}
                       <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-[10px] text-white/50 px-2 py-0.5 rounded z-20 pointer-events-none uppercase tracking-widest border border-white/10">Ad</div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center px-4">
                   <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                   <p className="text-gray-500 text-lg uppercase tracking-widest font-bold">Advertisement Space</p>
                   <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">This area is reserved for your ad management system.</p>
                 </div>
               )}
             </div>
             
             {/* Timer Overlay */}
             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 flex items-center gap-3 z-30">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
               <span className="text-white font-bold tracking-wide">Website opens in {adTimer}s</span>
             </div>
           </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="w-full h-screen overflow-hidden"
        >
          <iframe 
            src={site.url} 
            title={site.name}
            className="w-full h-full border-none"
            allowFullScreen
          />
        </motion.div>
      )}
    </div>
  );
}
