import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MovieCard({ movie, index, isGrid }) {
  const [isHovered, setIsHovered] = useState(false);
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const title = movie.title || movie.name || movie.original_name;

  if (!movie.poster_path) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`relative ${isGrid ? 'w-full' : 'w-[130px] sm:w-[160px] md:w-[190px] lg:w-[210px]'} shrink-0 cursor-pointer h-full z-10 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${movie.id}?type=${type}`} className="block w-full h-full p-2">
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-transform duration-300">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={title}
            fill
            sizes="(max-width: 640px) 130px, (max-width: 768px) 160px, (max-width: 1024px) 190px, 210px"
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            priority={index < 8}
          />

          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <h3 className="text-white font-bold text-xs md:text-sm truncate">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-1">
              <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">{movie.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
