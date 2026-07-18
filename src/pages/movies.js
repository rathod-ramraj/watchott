import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getMoviesList, getGenreMovies } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';
import { useRouter } from 'next/router';

// Sample common TMDB Movie Genres mapping
const GENRES = [
  { id: 'all', name: 'All Movies' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 18, name: 'Drama' },
  { id: 53, name: 'Thriller' },
  { id: 14, name: 'Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 10751, name: 'Family' },
];

export default function Movies() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');

  const fetchMovies = useCallback(async (pageNumber, genreId) => {
    setLoading(true);
    try {
      let newMovies = [];
      if (genreId === 'all') {
        newMovies = await getMoviesList(pageNumber);
      } else {
        newMovies = await getGenreMovies(genreId);
      }

      if (pageNumber === 1) {
        setMovies(newMovies || []);
      } else {
        setMovies((prev) => [...prev, ...(newMovies || [])]);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const g = router.query.genre;
      if (g && g !== 'all') {
        const num = Number(g);
        setSelectedGenre(isNaN(num) ? 'all' : num);
      } else {
        setSelectedGenre('all');
      }
    }
  }, [router.isReady, router.query.genre]);

  useEffect(() => {
    Promise.resolve().then(() => fetchMovies(1, selectedGenre));
  }, [selectedGenre, fetchMovies]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(next, selectedGenre);
  };

  return (
    <>
      <Head>
        <title>Movies - WATCHOTT</title>
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </Head>

      <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 py-12 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">Movies</h1>

          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  router.push({ pathname: '/movies', query: g.id === 'all' ? {} : { genre: g.id } }, undefined, { shallow: true });
                }}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedGenre === g.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 gap-y-14"
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex justify-center w-full">
              <MovieCard movie={{ ...movie, media_type: 'movie' }} isGrid={true} index={index} />
            </div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {(selectedGenre === 'all' && movies.length > 0) && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="btn-primary px-10 py-3 disabled:opacity-50 text-white border border-white/20 rounded-md"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}


