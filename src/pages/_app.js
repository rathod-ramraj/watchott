import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { AdProvider } from '@/contexts/AdContext';

import Head from 'next/head';

export default function App({ Component, pageProps, router }) {
  const [splashFinished, setSplashFinished] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstall(false);
      }
    }
  };

  return (
    <AdProvider>
      <Head>
        <link rel="icon" href="/favicon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.png?v=3" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <Layout>
        <Component {...pageProps} key={router.route} />
      </Layout>
      {showInstall && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-2xl flex items-center gap-4">
          <div className="text-white text-sm font-medium">Install WATCHOTT for a better experience</div>
          <button onClick={handleInstallClick} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Install</button>
          <button onClick={() => setShowInstall(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}
    </AdProvider>
  );
}


