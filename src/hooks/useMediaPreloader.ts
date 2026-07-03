import { useEffect, useRef } from 'react';

type MediaItem = {
  mediaType: 'video' | 'img';
  url: string;
};

const hasMedia = (item: unknown): item is MediaItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'mediaType' in item &&
    'url' in item
  );
};

/**
 * A custom hook that preloads media resources such as images and videos.

 * This hook is useful for preloading images and videos to ensure they are available
 * and ready to use before rendering them in the UI. It uses a `useRef` to store preloaded
 * media resources in a map, preventing duplicate loading of the same media resources. Media
 * is preloaded only if it matches the expected structure and type.
 */
export const useMediaPreloader = <T, >(items: T[]) => {
  const preloadedRef = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map());

  useEffect(() => {
    items.forEach(item => {
      if (!hasMedia(item)) return;
      if (preloadedRef.current.has(item.url)) return;

      if (item.mediaType === 'img') {
        const img = new Image();
        img.src = item.url;
        preloadedRef.current.set(item.url, img);
      } else {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = item.url;
        video.load();
        preloadedRef.current.set(item.url, video);
      }
    });
  }, []);
};
