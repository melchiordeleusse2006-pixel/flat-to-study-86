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

export function buildSrcSet(url: string, widths: number[] = [320, 480, 640, 768, 1024, 1280], quality: number = 70) {
  return widths
    .map((w) => `${transformSupabaseImage(url, { width: w, quality })} ${w}w`)
    .join(', ');
}
