import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Row({ title, fetchMethod, id, initialData }) {
  const [movies, setMovies] = useState(initialData || []);
  const [hasFetched, setHasFetched] = useState(!!(initialData && initialData.length > 0));
  const [error, setError] = useState(false);
  const rowRef = useRef(null);

  // Sync movies if initialData changes (e.g. from SSR)
  useEffect(() => {
    if (initialData && initialData.length > 0 && movies.length === 0) {
      const timer = setTimeout(() => {
        setMovies(initialData);
        setHasFetched(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialData, movies.length]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasFetched) {
        setHasFetched(true);
      }
    }, { rootMargin: '300px' });
    
    if (rowRef.current) observer.observe(rowRef.current);
    
    return () => observer.disconnect();
  }, [hasFetched]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (fetchMethod && hasFetched && movies.length === 0 && !error) {
         try {
           const data = await fetchMethod();
           if (isMounted) {
             const results = Array.isArray(data) ? data : [];
             setMovies(results);
             if (results.length === 0) setError(true);
           }
         } catch (e) {
             console.error('fetch err', e);
             if (isMounted) setError(true);
         }
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [fetchMethod, hasFetched, movies.length, error]);

  return (
    <motion.div 
      id={id} 
      ref={rowRef} 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full relative py-4 md:py-8 pl-6 md:pl-[120px] 2xl:pl-[140px] z-20 overflow-visible row-container group/row min-h-[250px]"
    >
      <div className="flex items-center justify-between pr-8 md:pr-16 lg:pr-24 mb-5 md:mb-7 gap-4">
        <h2 className="text-xl md:text-2xl lg:text-[1.75rem] font-bold tracking-tight text-white/90 group-hover/row:text-white transition-colors">
          {title}
        </h2>
        
        <Link href={`/movies`} className="flex items-center gap-1 text-sm md:text-base font-bold text-blue-500 hover:text-white transition-all duration-300 group/see">
          <span>See More</span>
          <ChevronRight size={18} className="transition-transform group-hover/see:translate-x-1" />
        </Link>
      </div>
      
      {(!movies || movies.length === 0) ? (
        <div className="w-full flex gap-4 overflow-hidden">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] shrink-0 aspect-[2/3] bg-[#1a1c23] animate-pulse rounded-xl" />
           ))}
        </div>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Mousewheel, FreeMode, Scrollbar]}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            scrollbar={{ draggable: true, hide: true }}
            spaceBetween={12}
            slidesPerView="auto"
            className="w-full h-full !overflow-visible pb-4"
            breakpoints={{
              320: { slidesPerView: 'auto', spaceBetween: 10 },
              640: { slidesPerView: 'auto', spaceBetween: 15 },
              1024: { slidesPerView: 'auto', spaceBetween: 20 },
              1440: { slidesPerView: 'auto', spaceBetween: 24 },
            }}
          >
            {movies.map((movie, index) => (
              <SwiperSlide key={movie.id} className="!w-auto">
                <MovieCard 
                  movie={movie} 
                  index={index}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </motion.div>
  );
}
