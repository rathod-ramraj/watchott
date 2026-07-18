import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, Check } from 'lucide-react';
import { getTrendingMovies } from '@/services/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Image from 'next/image';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10765: 'Sci-Fi & Fantasy',
  10768: 'War & Politics', 10763: 'News', 10764: 'Reality', 10766: 'Soap', 10767: 'Talk'
};

const getGenreNames = (ids) => {
  if (!ids) return '';
  return ids.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(', ');
};

function HeroWatchlistBtn({ movie }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  // Sync state with localStorage whenever movie changes or storage event occurs
  useEffect(() => {
    if (typeof window === 'undefined' || !movie?.id) return;

    const checkWatchlist = () => {
      const saved = localStorage.getItem('premium_ott_mylist');
      let isMovieInWatchlist = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          isMovieInWatchlist = parsed.some(item => item.id === movie.id);
        } catch (e) {
          console.error("Failed to parse watchlist from localStorage", e);
        }
      }

      // Use timeout to avoid sync setState in effect warning
      setTimeout(() => {
        setInWatchlist(isMovieInWatchlist);
      }, 0);
    };

    checkWatchlist(); // Initial check when movie changes

    // Listen for changes to localStorage from other tabs/windows
    const handleStorageChange = (event) => {
      if (event.key === 'premium_ott_mylist') {
        checkWatchlist();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [movie]); // Dependency on movie ensures re-check when movie prop changes

  const toggleWatchlist = () => {
    const saved = localStorage.getItem('premium_ott_mylist');
    let parsed = [];
    try { parsed = saved ? JSON.parse(saved) : []; } catch { }

    if (inWatchlist) {
      parsed = parsed.filter(item => item.id !== movie.id);
      setInWatchlist(false);
    } else {
      parsed.unshift(movie);
      setInWatchlist(true);
    }
    localStorage.setItem('premium_ott_mylist', JSON.stringify(parsed));
  };

  return (
    <button
      onClick={toggleWatchlist}
      className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 border transition-all duration-300 rounded-md font-bold tracking-wide backdrop-blur-md ${inWatchlist
        ? 'bg-white/20 border-white/40 text-white'
        : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10 text-white'
        }`}
    >
      {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
      <span className="hidden sm:inline uppercase">{inWatchlist ? 'Saved' : 'My List'}</span>
    </button>
  );
}

export default function HeroSlider({ initialData }) {
  const [movies, setMovies] = useState(initialData || []);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ((!movies || movies.length === 0)) {
      const fetchMovies = async () => {
        const trending = await getTrendingMovies();
        setMovies(trending.slice(0, 10));
      };
      fetchMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!movies || movies.length === 0) {
    return <div className="w-full h-[60vh] md:h-[85vh] bg-[#0f1014] animate-pulse"></div>;
  }

  return (
    <div className={`relative w-full overflow-hidden select-none hero-slider-container ${isMobile ? 'h-[65vh] hero-slider-mobile' : 'h-[85vh] md:h-[90vh]'}`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        grabCursor={true}
        allowTouchMove={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => `<span class="${className} custom-bullet"></span>`
        }}
        loop={true}
        className="w-full h-full"
      >
        {movies.filter(m => m.backdrop_path || m.poster_path).map((movie, index) => {
          const type = movie.media_type || (movie.title ? 'movie' : 'tv');
          const title = movie.title || movie.name || movie.original_name;
          const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
          const imagePath = movie.backdrop_path || movie.poster_path;

          return (
            <SwiperSlide key={movie.id}>
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={`${TMDB_IMAGE_BASE_URL}${imagePath}`}
                  alt={title}
                  fill
                  className="object-cover object-top"
                  priority={index < 2}
                  sizes="100vw"
                  quality={90}
                />

                {/* WATCHOTT Gradients */}
                <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-[#0f1014] via-[#0f1014]/70 to-transparent pointer-events-none" />
                {!isMobile && (
                  <div className="absolute inset-y-0 left-0 w-full md:w-[70%] bg-gradient-to-r from-[#0f1014] via-[#0f1014]/50 to-transparent pointer-events-none" />
                )}
              </div>

              <div className={`absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-10 pb-16 md:pb-24 ${isMobile ? 'items-start' : 'md:pl-[120px]'}`}>
                <div className="w-full flex md:items-center gap-6 lg:gap-14">

                  {/* Portrait Poster on Desktop */}
                  {!isMobile && movie.poster_path && (
                    <div className="hidden lg:block w-[180px] xl:w-[220px] shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden mt-12 border border-white/10 ring-1 ring-white/20">
                      <Image
                        src={`${TMDB_POSTER_URL}${movie.poster_path}`}
                        alt={title}
                        width={220}
                        height={330}
                        className="w-full h-auto object-cover hover:scale-110 transition-transform duration-700 ease-out"
                        priority={index < 2}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-4 max-w-full md:max-w-[700px]">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.8rem] font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl">
                      {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-300 font-bold uppercase tracking-wide">
                      <span className={`px-2 py-0.5 rounded text-xs font-black shadow-lg ${parseFloat(rating) >= 7 ? 'bg-green-500 text-white' : 'bg-white/10 text-white'}`}>
                        {rating} ★
                      </span>
                      <span className="text-gray-600">•</span>
                      <span>{movie.release_date?.substring(0, 4) || movie.first_air_date?.substring(0, 4)}</span>
                      <span className="text-gray-600">•</span>
                      <span className="truncate">{getGenreNames(movie.genre_ids)}</span>
                    </div>

                    <p className="text-sm md:text-lg text-white/50 font-medium max-w-2xl line-clamp-3 leading-relaxed mt-1">
                      {movie.overview}
                    </p>

                    <div className="flex items-center gap-4 mt-6">
                      <Link
                        href={`/watch/${movie.id}?type=${type}`}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-white transition-all duration-300 rounded-md text-black font-black tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95"
                      >
                        <Play className="w-5 h-5 fill-black" />
                        <span>WATCH NOW</span>
                      </Link>

                      <HeroWatchlistBtn movie={movie} />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style jsx global>{`
        .custom-bullet {
          width: 8px !important;
          height: 8px !important;
          background: rgba(255, 255, 255, 0.2) !important;
          opacity: 1 !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .swiper-pagination-bullet-active.custom-bullet {
          background: #fff !important;
          width: 28px !important;
          border-radius: 4px !important;
        }
        .hero-slider-mobile .swiper-pagination { bottom: 30px !important; }
      `}</style>
    </div>
  );
}
