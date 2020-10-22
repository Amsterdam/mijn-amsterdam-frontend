import { useState, useCallback, useLayoutEffect } from 'react';

function getSize(el: HTMLElement | null) {
  if (!el) {
    return {
      width: 0,
      height: 0,
    };
  }

  return el.getBoundingClientRect();
}

export function useComponentSize(el: HTMLElement | null) {
  const [ComponentSize, setComponentSize] = useState(getSize(el));

  const handleResize = useCallback(
    function handleResize() {
      if (el) {
        setComponentSize(getSize(el));
      }
    },
    [el, setComponentSize]
  );

  useLayoutEffect(() => {
    if (!el) {
      return;
    }

    handleResize();

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(el);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver?.disconnect();
        resizeObserver = null;
      }
    };
  }, [el, handleResize]);

  return ComponentSize;
}
