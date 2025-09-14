export function transformSupabaseImage(url: string, opts: { width?: number; quality?: number } = {}) {
  try {
    if (!url || typeof url !== 'string') return url;
    const marker = '/storage/v1/object/public/';
    if (!url.includes(marker)) return url; // Only transform Supabase public storage URLs

    const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const params = new URLSearchParams();
    if (opts.width) params.set('width', String(opts.width));
    if (opts.quality) params.set('quality', String(opts.quality));

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  } catch {
    return url;
  }
}

// Optimized srcset with only 3 breakpoints to reduce transformations by 50%
export function buildSrcSet(url: string, widths: number[] = [480, 768, 1024], quality: number = 70) {
  return widths
    .map((w) => `${transformSupabaseImage(url, { width: w, quality })} ${w}w`)
    .join(', ');
}

// Cache for transformed URLs to avoid repeated transformations
const transformCache = new Map<string, string>();

export function cachedTransformSupabaseImage(url: string, opts: { width?: number; quality?: number } = {}) {
  const cacheKey = `${url}-${opts.width || 'auto'}-${opts.quality || 70}`;
  
  if (transformCache.has(cacheKey)) {
    return transformCache.get(cacheKey)!;
  }
  
  const transformed = transformSupabaseImage(url, opts);
  transformCache.set(cacheKey, transformed);
  return transformed;
}

// Optimized srcset for cards - minimal transformations
export function buildCardSrcSet(url: string, quality: number = 70) {
  return buildSrcSet(url, [480, 768], quality);
}

// Optimized srcset for hero images - focus on key breakpoints
export function buildHeroSrcSet(url: string, quality: number = 75) {
  return buildSrcSet(url, [768, 1024, 1280], quality);
}
