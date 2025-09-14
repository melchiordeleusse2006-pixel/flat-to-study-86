import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImagesOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useOptimizedImages = (options: UseOptimizedImagesOptions = {}) => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const current = imgRef.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [threshold, rootMargin, hasLoaded]);

  return {
    imgRef,
    isVisible,
    hasLoaded
  };
};