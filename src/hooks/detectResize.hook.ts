import { useEffect, useState } from 'react';
import { debounce } from 'throttle-debounce';

export default function useDetectResizing(debounceMS: number = 400) {
  const [isResizing, setResizing] = useState(false);

  useEffect(() => {
    const debounceResize = debounce(debounceMS, () => {
      setResizing(false);
    });

    const startResize = () => {
      if (isResizing !== true) {
        setResizing(true);
      }
    };

    window.addEventListener('resize', startResize);
    window.addEventListener('resize', debounceResize);

    return () => {
      window.removeEventListener('resize', debounceResize);
      window.removeEventListener('resize', startResize);
    };
  }, []);

  return isResizing;
}
