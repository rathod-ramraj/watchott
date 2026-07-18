import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getTrendingMovies } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const data = await getTrendingMovies();
      setMovies(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchTrending());
  }, []);

  return (
    <>
      <Head>
        <title>Trending - WATCHOTT</title>
      </Head>

      <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 py-12 min-h-screen lg:pt-24 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-bold tracking-tight text-white"
          >
            Trending Now
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-14"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex justify-center w-full">
              <MovieCard movie={{ ...movie }} isGrid={true} />
            </div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
}


