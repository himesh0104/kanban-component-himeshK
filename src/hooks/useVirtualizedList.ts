import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface UseVirtualizedListOptions<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualizedListOptions<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScrollEvent = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScrollEvent);
    return () => container.removeEventListener('scroll', handleScrollEvent);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
    handleScroll,
  };
};