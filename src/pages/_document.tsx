import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        {/* Videasy streaming API preconnect */}
        <link rel="preconnect" href="https://player.videasy.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://player.videasy.net" />
        <link rel="preconnect" href="https://api.videasy.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.videasy.net" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

