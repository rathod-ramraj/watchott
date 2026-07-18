import Head from 'next/head';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/HeroSlider';
import Row from '@/components/Row';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNetflixOriginals, getGenreMovies, getBollywoodMovies, getAnime } from '@/services/tmdb';

export async function getStaticProps() {
  try {
    const results = await Promise.allSettled([
      getTrendingMovies()
    ]);

    const trending = results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value.slice(0, 10) : [];

    return {
      props: {
        initialData: {
          trending,
          bollywood: [],
          popular: [],
          originals: [],
          topRated: []
        }
      },
      revalidate: 3600
    };
  } catch {
    return { props: { initialData: {} } };
  }
}

export default function Home({ initialData }) {
  return (
    <>
      <Head>
        <title>WATCHOTT | Premium Streaming</title>
        <meta name="description" content="A simple, clean streaming platform for all your favorite content." />
      </Head>

      <div className="relative w-full min-h-screen bg-[#0f1014] selection:bg-blue-500/20 text-white pb-20 overflow-x-hidden">
        
        {/* Main Hero View */}
        <div className="w-full">
          <HeroSlider initialData={initialData?.trending} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-20 flex flex-col space-y-2 md:space-y-4 mt-[-40px] md:mt-[-80px]"
        >
          {/* Section rows matching WATCHOTT layout exactly */}
          <Row title="Trending Now" fetchMethod={getTrendingMovies} id="trending" initialData={initialData?.trending} />
          <Row title="Bollywood Greats" fetchMethod={getBollywoodMovies} id="bollywood" initialData={initialData?.bollywood} />
          <Row title="Original Hits" fetchMethod={getNetflixOriginals} id="originals" initialData={initialData?.originals} />
          <Row title="Top Picks" fetchMethod={getTopRatedMovies} id="top-rated" initialData={initialData?.topRated} />
          <Row title="Popular Movies" fetchMethod={getPopularMovies} id="popular" initialData={initialData?.popular} />
          <Row title="Anime Collection" fetchMethod={getAnime} id="anime" />
          
          <div className="h-20" />

          <Row title="Action Stories" fetchMethod={() => getGenreMovies(28)} id="action" />
          <Row title="Comedy Night" fetchMethod={() => getGenreMovies(35)} id="comedy" />
        </motion.div>
      </div>
    </>
  );
}
