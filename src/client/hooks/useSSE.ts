import { useEffect, useMemo } from 'react';

export function useSSE(
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
    const closeEventSource = () => {
      console.log('SSE:close');
      es.close();
    };

    es.addEventListener('error', logError);
    es.addEventListener('open', logOpen);
    es.addEventListener('message', logMessage);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, callback);

    return () => {
      console.log('down boy!');
      es.removeEventListener('error', logError);
      es.removeEventListener('open', logOpen);
      es.removeEventListener('message', logMessage);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, callback);
    };
  }, [eventName, es, callback]);
}
