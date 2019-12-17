import { useEffect, useState } from 'react';

export interface DomElementDimensions {
  width: number;
  height: number;
}

export function useDomElementDimensions(ref: any) {
  const [dimensions, setDimensions] = useState<DomElementDimensions>({
    width: 0,
    height: 0,
  });
  const { current } = ref;
  useEffect(() => {
    if (current) {
      const { width, height } = current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [current]);

  return dimensions;
}
