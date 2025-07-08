import { useEffect, useState } from 'react';

import { useComponentSize } from './useComponentSize.ts';

export function useContentDimensions(contentRef: React.RefObject<HTMLElement>) {
  const size = useComponentSize(contentRef.current);

  const [contentDimensions, setDimensions] = useState({
    width: size.width,
    height: size.height,
  });

  useEffect(() => {
    if (
      contentRef &&
      contentRef.current &&
      (size.width !== contentDimensions.width ||
        size.height !== contentDimensions.height)
    ) {
      setDimensions({
        width: size.width,
        height: size.height,
      });
    }
  }, [contentRef, size, contentDimensions]);

  return contentDimensions;
}
