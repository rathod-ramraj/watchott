import axios from 'axios';

const TMDB_API_KEY = '05a1c6247adeeb5005de9baa8b8604e3';
const ALTERNATIVE_BASE_URLS = [
  'https://api.themoviedb.org/3',
  'https://api.tmdb.org/3',
  'https://proxy.cors.sh/https://api.themoviedb.org/3'
];

let currentBaseUrlIndex = 0;

export const tmdb = axios.create({
  baseURL: ALTERNATIVE_BASE_URLS[currentBaseUrlIndex],
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 2000,
});

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

const getCached = (url) => {
  if (!cache.has(url)) return null;
  const { data, timestamp } = cache.get(url);
  if (Date.now() - timestamp > CACHE_TTL) {
    cache.delete(url);
    return null;
  }
  return data;
};

const setCached = (url, data) => {
  // Evict oldest if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(url, { data, timestamp: Date.now() });
};

const fetchWithCache = async (url) => {
  const cached = getCached(url);
  if (cached) return cached;

  try {
    const { data } = await tmdb.get(url);
    setCached(url, data);
    return data;
  } catch {
    // Suppress terminal fetch error logging
    // Try fallback once if it's a network/DNS error
    if (currentBaseUrlIndex < ALTERNATIVE_BASE_URLS.length - 1) {
      currentBaseUrlIndex++;
      tmdb.defaults.baseURL = ALTERNATIVE_BASE_URLS[currentBaseUrlIndex];
      console.log(`Switching TMDB Base URL to ${tmdb.defaults.baseURL}`);
      try {
        const { data } = await tmdb.get(url);
        setCached(url, data);
        return data;
      } catch {
        return null;
      }
    }
    return null;
  }
};

export const getTrendingMovies = async () => {
  const data = await fetchWithCache('/trending/movie/day');
  return data?.results || [];
};

export const getPopularMovies = async () => {
  const data = await fetchWithCache('/movie/popular');
  return data?.results || [];
};

export const getTopRatedMovies = async () => {
  const data = await fetchWithCache('/movie/top_rated');
  return data?.results || [];
};

export const getNetflixOriginals = async () => {
  const data = await fetchWithCache('/discover/tv?with_networks=213');
  return data?.results || [];
};

export const getBollywoodMovies = async () => {
  const data = await fetchWithCache('/discover/movie?with_original_language=hi&region=IN&sort_by=popularity.desc');
  return data?.results || [];
};

export const getAnime = async (page = 1) => {
  const data = await fetchWithCache(`/discover/tv?with_genres=16&with_original_language=ja&page=${page}`);
  return data?.results || [];
};

export const searchContent = async (query) => {
  if (!query) return [];
  const data = await fetchWithCache(`/search/multi?query=${encodeURIComponent(query)}`);
  return (data?.results || []).filter(x => x.media_type !== 'person');
};

export const getMovieDetails = async (id, type = 'movie') => {
  if (!id || id === 'undefined' || id === 'null') return null;

  let url = `/${type}/${id}?append_to_response=credits,videos,recommendations,external_ids`;

  const cached = getCached(url);
  if (cached) {
    return JSON.parse(JSON.stringify(cached));
  }

  const data = await fetchWithCache(url);
  if (!data) return null;

  // OMDB integration for additional details if possible
  if (data.external_ids?.imdb_id && !data.omdb) {
    try {
      const omdbRes = await fetch(`https://www.omdbapi.com/?i=${data.external_ids.imdb_id}&apikey=221a02ea`);
      const omdbData = await omdbRes.json();
      if (omdbData.Response === "True") {
        data.omdb = omdbData;
        setCached(url, data);
      }
    } catch { }
  }

  return data;
};

export const getTMDBImageUrl = (path, size = 'original') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getTvSeasons = async (id, seasonNum) => {
  const data = await fetchWithCache(`/tv/${id}/season/${seasonNum}`);
  return data || { episodes: [] };
};

export const getGenreMovies = async (genreId) => {
  const data = await fetchWithCache(`/discover/movie?with_genres=${genreId}`);
  return data?.results || [];
}

export const getMoviesList = async (page = 1) => {
  const data = await fetchWithCache(`/discover/movie?page=${page}`);
  return data?.results || [];
}

export const getTvShowsList = async (page = 1) => {
  const data = await fetchWithCache(`/discover/tv?page=${page}`);
  return data?.results || [];
}

