import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getAnime } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';

export default function Anime() {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchShows = async (pageNumber) => {
    setLoading(true);
    try {
      let data = await getAnime(pageNumber);
      if (pageNumber === 1) {
        setShows(data);
      } else {
        setShows((prev) => [...prev, ...data]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchShows(1));
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchShows(next);
  };

  return (
    <>
      <Head>
        <title>Anime - WATCHOTT</title>
      </Head>
      
      <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 py-12 min-h-screen">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">Anime</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-14"
        >
           {shows.map((show, index) => (
             <div key={show.id} className="flex justify-center w-full">
               <MovieCard movie={{ ...show, media_type: 'tv' }} isGrid={true} index={index} />
             </div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex justify-center my-12">
             <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {(shows.length > 0) && (
          <div className="flex justify-center mt-12 mb-8">
             <button 
               onClick={loadMore} 
               disabled={loading}
               className="btn-primary px-10 py-3 disabled:opacity-50 text-white border border-white/20 rounded-md"
             >
                {loading ? 'Loading...' : 'Load More Anime'}
             </button>
          </div>
        )}
      </div>
    </>
  );
}


