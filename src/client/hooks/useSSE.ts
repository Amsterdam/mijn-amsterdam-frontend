import { useEffect, useMemo } from 'react';

export function useSSEEvent(
  path: string,
  eventName: string,
  callback: (message: any) => void
) {
  const es = useMemo(() => {
    const es = new EventSource(path);
    return es;
  }, [path]);

  useEffect(() => {
    const logError = (error: any) => console.log('SSE:error', error);
    const logOpen = () => console.log('SSE:open');
    const logMessage = () => console.log('SSE:message');

    es.addEventListener('error', logError);
    es.addEventListener('open', logOpen);
    es.addEventListener('message', logMessage);
    es.addEventListener(eventName, callback);

    return () => {
      es.removeEventListener('error', logError);
      es.removeEventListener('open', logOpen);
      es.removeEventListener('message', logMessage);
      es.removeEventListener(eventName, callback);
    };
  }, [eventName, es, callback]);
}
