import Link from 'next/link';
import Image from 'next/image';

const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w92';

function getMediaType(item) {
  if (!item) return 'movie';
  if (item.media_type) return item.media_type;
  // TMDB movie results typically contain `title`, while TV uses `name`.
  return item.title ? 'movie' : 'tv';
}

function getTitle(item) {
  return item?.title || item?.name || item?.original_name || 'Untitled';
}

function getYear(item) {
  const raw = item?.release_date || item?.first_air_date || '';
  return raw ? raw.substring(0, 4) : '';
}

function getRating(item) {
  const r = item?.vote_average;
  if (r === null || r === undefined) return 'NR';
  const n = Number(r);
  return Number.isFinite(n) ? n.toFixed(1) : 'NR';
}

export default function Top10Widget({ items = [], title = 'Top 10 Today' }) {
  const list = Array.isArray(items) ? items.slice(0, 10) : [];

  return (
    <div className="w-full bg-[#16181f]/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
            <span className="text-blue-300 font-black">10</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-black text-white truncate">{title}</h2>
            <p className="text-xs md:text-sm text-gray-400">Fresh picks from TMDB trending</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-blue-400/70" />
          Updated regularly
        </div>
      </div>

      <div className="p-4 md:p-6">
        {list.length === 0 ? (
          <div className="grid gap-3">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[76px] rounded-2xl bg-white/5 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {list.map((item, idx) => {
              const mediaType = getMediaType(item);
              const posterPath = item?.poster_path;
              const posterSrc = posterPath ? `${TMDB_POSTER_URL}${posterPath}` : '';
              const year = getYear(item);
              const rating = getRating(item);
              const watchHref = `/watch/${item.id}?type=${mediaType}`;

              return (
                <Link
                  key={item.id}
                  href={watchHref}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-white/0 border border-white/0 hover:bg-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-sm md:text-base font-black text-gray-200 group-hover:text-white">{idx + 1}</span>
                  </div>

                  {posterSrc ? (
                    <div className="relative w-14 h-20 md:w-16 md:h-[88px] rounded-xl overflow-hidden border border-white/10 bg-black/30 shrink-0">
                      <Image
                        src={posterSrc}
                        alt={getTitle(item)}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-20 md:w-16 md:h-[88px] rounded-xl border border-white/10 bg-black/30 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm md:text-[15px] text-white/90 truncate group-hover:text-white">
                        {getTitle(item)}
                      </span>
                      <span className="text-[11px] md:text-xs text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {rating}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] md:text-xs text-gray-500 truncate">
                      {year ? `${year} • ` : ''}
                      {mediaType.toUpperCase()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

