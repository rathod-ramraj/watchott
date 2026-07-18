import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { useState } from 'react';
import SplashScreen from '@/components/SplashScreen';
import { AdProvider } from '@/contexts/AdContext';

export default function App({ Component, pageProps, router }) {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <AdProvider>
      {!splashFinished && <SplashScreen onComplete={() => setSplashFinished(true)} />}
      <Layout>
        <Component {...pageProps} key={router.route} />
      </Layout>
    </AdProvider>
  );
}


