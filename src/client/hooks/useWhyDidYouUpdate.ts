import { useEffect, useRef } from 'react';

// Utility / development hook taken from https://usehooks.com/useWhyDidYouUpdate/
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<any>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: any = {};

      allKeys.forEach((key) => {
        // If previous is different from current

        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj

          changesObj[key] = {
            from: previousProps.current[key],

            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj);
      }
    }

    previousProps.current = props;
  });
}
