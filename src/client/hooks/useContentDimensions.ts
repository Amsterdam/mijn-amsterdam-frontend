import { useEffect, useState } from 'react';
import { useComponentSize } from './useComponentSize';

export function useContentDimensions(contentRef: React.RefObject<HTMLElement>) {
  const size = useComponentSize(contentRef.current);

  const [contentDimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (
      contentRef &&
      contentRef.current &&
      size.width !== contentDimensions.width &&
      size.height !== contentDimensions.height
    ) {
      setDimensions({
        width: size.width,
        height: size.height,
      });
    }
  }, [contentRef, size, contentDimensions]);

  return contentDimensions;
}
