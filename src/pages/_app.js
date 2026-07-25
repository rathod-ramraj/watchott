import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { AdProvider } from '@/contexts/AdContext';

import Head from 'next/head';

export default function App({ Component, pageProps, router }) {
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('SW registered!', reg),
        (err) => console.error('SW failed!', err)
      );
    }
  }, []);

  return (
    <AdProvider>
      <Head>
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=2" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <Layout>
        <Component {...pageProps} key={router.route} />
      </Layout>
    </AdProvider>
  );
}


