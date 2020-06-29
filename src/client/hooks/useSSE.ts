import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useState } from 'react';

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
    if (!es) {
      console.info('Connecting to SSE');
      connect();
    }
    // eslint-disable-next-line
  }, [es]);

  useEffect(() => {
    if (!es) {
      return;
    }

    const handleError = (error: any) => {
      console.info('Error in SSE connection');

      es.close();

      Sentry.captureMessage(
        "EventSource can't establish a connection to the server."
      );

      callback({
        ALL: {
          status: 'ERROR',
          message:
            "EventSource can't establish a connection to the server. Connection retry terminated.",
        },
      });
    };
    const handleOpen = () => {
      console.info('Open SSE connection');
    };
    const closeEventSource = () => {
      console.info('Close SSE connection');
      es.close();
    };
    const onMessageEvent = (message: any) => callback(JSON.parse(message.data));

    es.addEventListener('error', handleError);
    es.addEventListener('open', handleOpen);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, onMessageEvent);

    return () => {
      console.info('Unmounting SSE hook');
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, onMessageEvent);
    };
  }, [eventName, es, callback, connect]);
}
