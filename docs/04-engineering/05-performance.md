# Performance

> **Purpose:** Backend, frontend, and infrastructure optimization checklists with UX state metrics
> **Source:** cosmic-comet §2.12, UX States Specification

---

## Backend Checklist

- [ ] Database indexes on all query columns
- [ ] N+1 queries eliminated
- [ ] Connection pooling configured
- [ ] Response compression enabled (gzip/brotli)
- [ ] Cache frequently accessed data
- [ ] Background jobs for heavy operations
- [ ] API response time < 200ms for 95% of requests
- [ ] WebSocket connection establishment < 100ms
- [ ] Database query timeout < 30s for all operations
- [ ] Rate limiting with exponential backoff for API endpoints
- [ ] Caching headers set correctly for all static assets

---

## Frontend Checklist

- [ ] Code splitting by route
- [ ] Image optimization (see [Image Loading Best Practices](#image-loading-best-practices))
- [ ] Font optimization
- [ ] Bundle size < 200KB (gzip)
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)
- [ ] Core Web Vitals within thresholds
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.0s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

---

## UX State Performance Standards

### Loading Performance Metrics

| State Type | Target Time | Implementation Pattern |
|------------|-------------|----------------------|
| **Initial Load** | < 1.5s | Skeleton screens, progressive loading |
| **Data Fetch** | < 800ms | TanStack Query with optimistic updates |
| **Navigation** | < 200ms | Preloading, route-level code splitting |
| **Form Submit** | < 500ms | Optimistic UI, loading indicators |
| **File Upload** | < 1s per 1MB | Progress bars, chunked uploads |

### Loading State Implementation Requirements

#### 1. Progressive Loading

```tsx
// packages/shared-components/loading/ProgressiveLoader.tsx
interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  loadingTime?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  fallback,
  loadingTime = 1000,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      setShowFallback(false);
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [loadingTime]);

  return (
    <>
      {showFallback && fallback}
      {showContent && children}
    </>
  );
};
```

#### 2. Skeleton Screen Timing

- **Skeleton display duration**: 300ms - 1000ms (based on expected load time)
- **Skeleton animation**: Continuous pulse effect to indicate loading
- **Skeleton complexity**: Match actual content structure
- **Skeleton to content transition**: Fade in/out (200ms)

#### 3. Loading States by Component Type

| Component Type | Loading Pattern | Target Time |
|----------------|----------------|-------------|
| **Page Load** | Skeleton screens | < 1.5s |
| **Data Table** | Row-wise skeleton | < 800ms |
| **Form** | Field-wise skeleton | < 500ms |
| **Image Gallery** | Card skeleton grid | < 1.2s |
| **Chart/Graph** | Placeholder with spinner | < 1s |

### Error State Performance

#### Error Handling Requirements

- **Error detection time**: < 100ms after request failure
- **Error display time**: < 200ms after detection
- **Error recovery options**: Immediate retry, alternative actions
- **Error logging**: Asynchronous, non-blocking

```tsx
// packages/shared-components/error/PerformanceErrorBoundary.tsx
export class PerformanceErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };
  errorStartTime = 0;

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.errorStartTime = Date.now();
    logErrorToService(error, errorInfo);
    
    // Ensure error UI is shown quickly
    requestAnimationFrame(() => {
      const errorDisplayTime = Date.now() - this.errorStartTime;
      if (errorDisplayTime > 200) {
        console.warn('Error display took too long:', errorDisplayTime);
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" style={{ animation: 'fadeIn 200ms' }}>
          {/* Error content */}
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Success State Performance

#### Success Feedback Requirements

- **Toast notification display time**: < 300ms after success
- **Animation duration**: 300ms - 500ms
- **Auto-dismiss timing**: 3s - 5s for success, 5s - 10s for errors
- **Animation timing**: Follow easing curves (ease-out)

```tsx
// packages/shared-components/feedback/PerformanceToast.tsx
export const PerformanceToast: React.FC<ToastProps> = ({
  type,
  title,
  description,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show toast quickly
    setIsVisible(true);
    setIsAnimating(true);

    // Auto-dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 300); // Wait for animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`toast toast-${type} ${isAnimating ? 'animate-in' : 'animate-out'}`}
      style={{
        animation: isAnimating 
          ? 'slideIn 300ms ease-out' 
          : 'slideOut 300ms ease-in'
      }}
    >
      {/* Toast content */}
    </div>
  );
};
```

### Network Performance Optimization

#### API Request Optimization

```tsx
// packages/shared-components/api/PerformanceApiClient.ts
export class PerformanceApiClient {
  private cache = new Map();
  private pendingRequests = new Map();

  async fetchWithPerformance<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string
  ): Promise<T> {
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(url)) {
      return this.pendingRequests.get(url);
    }

    const startTime = Date.now();
    const requestPromise = fetch(url, options);
    this.pendingRequests.set(url, requestPromise);

    try {
      const response = await requestPromise;
      const data = await response.json();
      
      const responseTime = Date.now() - startTime;
      
      // Log performance metrics
      if (responseTime > 1000) {
        console.warn(`Slow API request: ${url} took ${responseTime}ms`);
      }

      // Cache successful responses
      if (cacheKey && response.ok) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } finally {
      this.pendingRequests.delete(url);
    }
  }
}
```

### Bundle Performance Optimization

#### Code Splitting Strategy

```tsx
// packages/shared-components/utils/LoadableComponent.tsx
interface LoadableComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadTime?: number;
}

export const LoadableComponent: React.FC<LoadableComponentProps> = ({
  children,
  fallback = <Spinner />,
  loadTime = 200,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      const startTime = Date.now();
      
      // Simulate component loading
      await new Promise(resolve => setTimeout(resolve, loadTime));
      
      const loadTimeActual = Date.now() - startTime;
      if (loadTimeActual > loadTime * 2) {
        console.warn(`Component loading took longer than expected: ${loadTimeActual}ms`);
      }

      setIsLoaded(true);
      setShowFallback(false);
    };

    loadComponent();
  }, [loadTime]);

  return (
    <>
      {showFallback && fallback}
      {isLoaded && children}
    </>
  );
};
```

#### Performance Monitoring Integration

```tsx
// packages/shared-components/monitoring/PerformanceMonitor.tsx
export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          logNavigationMetrics(entry as PerformanceNavigationTiming);
        } else if (entry.entryType === 'resource') {
          logResourceMetrics(entry as PerformanceResourceTiming);
        } else if (entry.entryType === 'paint') {
          logPaintMetrics(entry as PerformancePaintTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

    return () => observer.disconnect();
  }, []);

  return null;
};
```

---

## Image Loading Best Practices

> **Purpose:** Comprehensive guidelines for serving optimized images in production
> **Sources:** web.dev (Google Chrome team), MDN Web Docs

### 1. Choose the Right Format

| Format | Transparency | Animation | Best For |
|---|---|---|---|
| **AVIF** | Yes | Yes | Best compression; photos, thumbnails |
| **WebP** | Yes | Yes | Excellent compression; wide browser support |
| **JPEG** | No | No | Photos where lossy compression is acceptable |
| **PNG** | Yes | No (APNG: Yes) | Screenshots, fine detail, sharp edges |
| **SVG** | N/A | Yes | Icons, logos, illustrations (resolution-independent) |

**Rules:**
- Prefer **AVIF** or **WebP** over JPEG/PNG — typically 25-50% smaller at equivalent quality
- Use **SVG** for icons, logos, and geometric shapes (scales to any resolution)
- Use **PNG** only when lossless compression is required (screenshots, text renders)
- **Never** encode text inside raster images — use web fonts instead

### 2. Serve Responsive Images

Use `srcset` + `sizes` to serve device-appropriate image sizes:

```html
<img
  src="hero-1200.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w, hero-1600.jpg 1600w"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Course hero image"
  width="1200"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

**Rules:**
- Generate 3-5 sizes per image (e.g., 400w, 800w, 1200w, 1600w)
- Always include `width` and `height` attributes to prevent Cumulative Layout Shift (CLS)
- Use `sizes` to hint the browser on display width before layout
- Use `<picture>` element for **art direction** (serving different crops/compositions per viewport):

```html
<picture>
  <source media="(max-width: 768px)" srcset="hero-cropped-mobile.webp" type="image/webp">
  <source media="(max-width: 768px)" srcset="hero-cropped-mobile.jpg">
  <source srcset="hero-desktop.webp" type="image/webp">
  <source srcset="hero-desktop.jpg">
  <img src="hero-desktop.jpg" alt="Course hero" width="1200" height="600">
</picture>
```

### 3. Lazy Loading

```html
<img src="below-fold.jpg" loading="lazy" decoding="async" alt="..." width="800" height="400">
```

**Rules:**
- Use `loading="lazy"` for all images below the fold (browser-native, no JS needed)
- **Never** lazy-load above-the-fold or LCP candidate images
- Add `decoding="async"` to avoid blocking the main thread during decode
- For framework-specific usage: `next/image` handles lazy loading automatically

### 4. Preload Critical Images (LCP)

For images that are the Largest Contentful Paint (LCP) element (hero images, profile photos):

```html
<link rel="preload" as="image" href="hero-1200.webp" type="image/webp">
```

**Rules:**
- Preload **only** the LCP image — preloading too many resources negates the benefit
- Specify `type` attribute so browsers that don't support the format skip the preload
- Combine with `<picture>` for format negotiation
- For Next.js: `next/image` with `priority` prop handles preloading

### 5. Replace Animated GIFs with Video

Animated GIFs are extremely large. Replace with `<video>`:

```html
<video autoplay loop muted playsinline width="400" height="300">
  <source src="animation.webm" type="video/webm">
  <source src="animation.mp4" type="video/mp4">
</video>
```

**Typical savings:** GIF (3.7 MB) → MP4 (551 KB) → WebM (341 KB) — up to **90% reduction**

**Conversion with FFmpeg:**
```bash
# MP4
ffmpeg -i animation.gif -b:v 0 -crf 25 -f mp4 -vcodec libx264 -pix_fmt yuv420p animation.mp4
# WebM
ffmpeg -i animation.gif -c vp9 -b:v 0 -crf 41 animation.webm
```

### 6. Use `next/image` (Framework Standard)

This project uses Next.js — always prefer `next/image` over raw `<img>`:

```tsx
import Image from 'next/image';

<Image
  src="/course-hero.jpg"
  alt="Course hero"
  width={1200}
  height={600}
  priority          // for LCP images only
  placeholder="blur" // shows blur-up while loading
  blurDataURL={blurDataUrl} // base64 blur placeholder
  quality={80}      // default 75, adjust per use case
/>
```

**Rules:**
- Use `priority` only for above-the-fold / LCP images
- Use `placeholder="blur"` for a polished loading experience
- Use `fill` prop with `objectFit` for responsive container-based images
- Remote images must be configured in `next.config.js` under `images.remotePatterns`

### 7. Content Delivery Network (CDN)

- Serve all static images through a CDN (Cloudflare, AWS CloudFront, Vercel Edge Network)
- Set aggressive `Cache-Control` headers for immutable assets:
  ```
  Cache-Control: public, max-age=31536000, immutable
  ```
- Use content-based cache keys (hash filenames) for cache busting
- Enable CDN image transformation/optimization where available (Cloudinary, Imgix, Vercel Image Optimization)

### 8. Compression & Quality

- **Photos:** Use lossy formats (AVIF/WebP/JPEG) at quality 75-85
- **Screenshots/UI:** Use lossless WebP or PNG
- **Icons/logos:** Use SVG (infinite resolution, tiny file size)
- Enable Brotli or gzip compression on the web server for all image responses
- Strip EXIF metadata from uploaded images (reduces file size, protects privacy)

### 9. Accessibility

- Every `<img>` must have a descriptive `alt` attribute
- Use `alt=""` (empty string) for decorative images
- Decorative images should use CSS `background-image` instead of `<img>`
- Avoid images of text — use real HTML text with web fonts
- Ensure sufficient color contrast in any text overlaid on images

### 10. Image Loading Checklist

- [ ] AVIF/WebP formats used with JPEG/PNG fallbacks
- [ ] `srcset` + `sizes` for responsive image delivery
- [ ] `width` and `height` set on all `<img>` elements (prevent CLS)
- [ ] `loading="lazy"` on below-the-fold images
- [ ] LCP image preloaded with `<link rel="preload">`
- [ ] Animated GIFs replaced with `<video>` elements
- [ ] `next/image` used instead of raw `<img>` tags
- [ ] Images served via CDN with immutable cache headers
- [ ] EXIF metadata stripped from user uploads
- [ ] All images have meaningful `alt` text
- [ ] Lighthouse "Properly size images" audit passes
- [ ] Lighthouse "Efficiently encode images" audit passes

---

## Infrastructure Checklist

- [ ] CDN configured for static assets
- [ ] Cache headers optimized
- [ ] Database query caching
- [ ] Queue processing parallelized
- [ ] Auto-scaling configured
