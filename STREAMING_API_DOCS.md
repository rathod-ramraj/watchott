# Streaming Server API Documentation

## Overview
This document describes the video streaming APIs integrated into the streaming server, including 111movies.net and videasy.net.

---

## 111movies.net API

### Movie Endpoint
```
https://111movies.net/movie/{id}
```

### TV Show Endpoint
```
https://111movies.net/tv/{id}/{season}/{episode}
```

### Parameters
| Parameter | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | IMDB ID (with `tt` prefix) or TMDB ID |
| `season` | Yes (TV only) | Season number |
| `episode` | Yes (TV only) | Episode number |

### Examples
- Movie: `https://111movies.net/movie/tt6263850`
- Movie: `https://111movies.net/movie/533535`
- TV Show: `https://111movies.net/tv/tt30217403/1/5`
- TV Show: `https://111movies.net/tv/240411/1/5`

### Features
- Minimal ads
- Auto-updating content
- Responsive design
- High quality streaming
- Fast streaming servers

---

## Videasy.net API

### Base URL
```
https://player.videasy.net/embed
```

### Movie Endpoint
```
https://player.videasy.net/embed/movie/{id}
```

### TV Show Endpoint
```
https://player.videasy.net/embed/tv/{id}/{season}/{episode}
```

### Parameters
| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `id` | Yes | - | IMDB ID (with `tt` prefix) or TMDB ID |
| `season` | Yes (TV only) | - | Season number |
| `episode` | Yes (TV only) | - | Episode number |
| `tmdb` | No | `0` | Set to `1` if using TMDB ID |
| `q` | No | `auto` | Quality: `auto`, `1080`, `720`, `480` |
| `sub` | No | `en` | Subtitle language code |
| `autoplay` | No | `0` | Set to `1` to enable autoplay |
| `mute` | No | `0` | Set to `1` to start muted |
| `poster` | No | - | Custom poster image URL |

### Examples
```
// Basic movie with IMDB ID
https://player.videasy.net/embed/movie/tt1375666

// Movie with TMDB ID
https://player.videasy.net/embed/movie/27205?tmdb=1

// TV episode with IMDB ID
https://player.videasy.net/embed/tv/tt0944947/1/1

// TV episode with TMDB ID
https://player.videasy.net/embed/tv/1399/1/1?tmdb=1

// High quality with autoplay
https://player.videasy.net/embed/movie/tt1375666?q=1080&autoplay=1
```

### Internal API Endpoint
```
GET /api/videasy?id={id}&type={movie|tv}&season={s}&episode={e}&tmdb={0|1}&quality={auto|1080|720|480}
```

Returns JSON with embed URL and iframe HTML when `format=json` is specified.

### Features
- Powerful and flexible video embed API
- Seamless integration
- Smooth user experience
- Cross-platform compatibility
- Secure streaming
- Quality selection
- Subtitle support
- Autoplay and mute options
- Custom poster support

---

## Server Integration

Both APIs are integrated into the streaming server as:

### Server 26 - Videasy
```javascript
{
  name: "Server 26",
  getUrl: (t, id, s, e, imdb) => t === 'movie' 
    ? `https://player.videasy.net/embed/movie/${imdb || id}` 
    : `https://player.videasy.net/embed/tv/${imdb || id}/${s}/${e}`
}
```

### Server 29a - 111movies
```javascript
{
  name: "Server 29a - 111movies",
  getUrl: (t, id, s, e, imdb) => t === 'movie' 
    ? `https://111movies.net/movie/${imdb || id}` 
    : `https://111movies.net/tv/${imdb || id}/${s}/${e}`
}
```

---

## Internal API Endpoints

### Proxy API
```
GET /api/proxy?url={stream_url}
```

Proxies video streams with:
- CORS headers
- Retry logic (3 attempts with exponential backoff)
- Security checks (blocks internal networks)
- Timeout handling (60s for HLS, 45s for others)
- Backpressure handling for streaming

### Channels API
```
GET /api/channels?country={country}&category={category}&search={query}&page={page}&limit={limit}
```

Returns IPTV channels with:
- Filtering by country, category, search
- Pagination support
- 6-hour cache
- Concurrent fetch prevention

### Health Check
```
GET /api/health
```

Returns server status and diagnostics.

### Validate Stream
```
POST /api/validate-stream
Body: { "url": "stream_url" }
```

Tests stream accessibility and returns quality assessment.

---

## CORS Configuration

All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS, HEAD
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Range, Authorization
Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges, Content-Type
```

---

## Error Handling

### Common Error Codes
| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid URL or parameters |
| 403 | Forbidden - Internal network access blocked |
| 408 | Request Timeout |
| 500 | Internal Server Error |
| 502 | Bad Gateway - Cannot connect to stream source |
| 503 | Service Unhealthy |

---

## Cache Strategy

### Playlist Files (.m3u8, .m3u)
- No cache for live streams
- Headers: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`

### Video Segments (.ts, .aac, .mp4, etc.)
- Short cache: 30 seconds to 5 minutes
- Headers: `Cache-Control: public, max-age=30, s-maxage=60`

### API Responses
- 5-minute cache for channels API
- Headers: `Cache-Control: public, max-age=300`

---

## Security

- Internal network access is blocked (localhost, 192.168.x.x, 10.x.x.x, etc.)
- URL validation required
- HTTPS enforced for external requests

---

*Last Updated: March 2026*
