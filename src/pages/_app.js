import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { AdProvider } from '@/contexts/AdContext';

import Head from 'next/head';

export default function App({ Component, pageProps, router }) {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <AdProvider>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <Layout>
        <Component {...pageProps} key={router.route} />
      </Layout>
    </AdProvider>
  );
}


