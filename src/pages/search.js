import { useState, useEffect } from 'react';
import Head from 'next/head';
import { SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchContent } from '@/services/tmdb';
import Image from 'next/image';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        const tmdbData = await searchContent(query);
        setResults(tmdbData);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(fn);
  }, [query]);

  return (
    <>
      <Head>
        <title>Search - WATCHOTT</title>
      </Head>

      <div className="container mx-auto px-6 md:pl-[110px] lg:pl-[130px] lg:pr-12 py-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto mb-16"
        >
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-7 h-7" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows, and more..."
            className="w-full bg-[#16181f] border border-[#2b3040] rounded-xl py-5 pl-16 pr-16 text-xl font-medium text-white outline-none focus:border-gray-400 transition-all font-sans"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              title="Clear Search"
            >
              <X className="w-7 h-7" />
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center my-12">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4"
            >
              {results.length > 0 ? (
                results.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-[#16181f] border border-transparent hover:bg-[#202430] transition-colors cursor-pointer" onClick={() => window.location.href = `/watch/${item.id}?type=${item.media_type || (item.title ? 'movie' : 'tv')}`}>
                    <div className="w-24 md:w-32 shrink-0 aspect-[2/3] relative rounded overflow-hidden">
                      {item.poster_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} fill sizes="(max-width: 768px) 96px, 128px" className="object-cover" alt={item.title || item.name} />
                      ) : (
                        <div className="w-full h-full bg-[#202430] flex items-center justify-center text-gray-500 text-xs text-center p-2">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="text-lg md:text-xl font-bold text-white mb-1 truncate">{item.title || item.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <span>{(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                        <span>•</span>
                        <span className="text-blue-400 font-bold">{item.vote_average?.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 md:line-clamp-3">{item.overview || "No description available."}</p>
                    </div>
                  </div>
                ))
              ) : (
                query.length > 2 && !loading && (
                  <div className="col-span-full text-center text-gray-400 text-lg font-medium mt-12">
                    No matching results found for &quot;<span className="text-white font-bold">{query}</span>&quot;
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}


