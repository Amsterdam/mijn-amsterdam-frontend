import { useEffect, useState, useCallback } from 'react';

export function useSSE(
  path: string,
  eventName: string,
  callback: (message: any) => void
) {
  const [es, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(path);
    setEventSource(es);
  }, [path]);

  useEffect(() => {
    connect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!es) {
      return;
    }
    let unMounted = false;
    const handleError = (error: any) => {
      es.close();
      console.log('SSE:error');
      setTimeout(() => {
        if (!unMounted) {
          console.log('SSE:reconnect-on-error');
          connect();
        }
      }, 500);
    };
    const logOpen = () => console.log('SSE:open');
    const logMessage = () => console.log('SSE:message');
    const closeEventSource = () => {
      console.log('SSE:close');
      es.close();
    };

    es.addEventListener('error', handleError);
    es.addEventListener('open', logOpen);
    es.addEventListener('message', logMessage);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, callback);

    return () => {
      unMounted = true;
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', logOpen);
      es.removeEventListener('message', logMessage);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, callback);
    };
  }, [eventName, es, callback, connect]);
}
