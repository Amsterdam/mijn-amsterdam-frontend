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
  useEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, [ref]);

  return dimensions;
}
