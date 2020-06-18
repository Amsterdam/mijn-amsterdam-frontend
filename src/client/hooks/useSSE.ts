import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useState } from 'react';

const RECONNECT_TIMEOUT_MS = 1000;
const MAX_RETRY_COUNT = 10;

let retryCount = 0;

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
    if (retryCount !== MAX_RETRY_COUNT) {
      retryCount += 1;
      console.info('Connecting to SSE, current retrycount:', retryCount);
      connect();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!es) {
      return;
    }
    let unMounted = false;
    let retryTimeout: any;

    const handleError = (error: any) => {
      console.info('Error in SSE connection');

      es.close();

      if (retryCount !== MAX_RETRY_COUNT) {
        retryTimeout = setTimeout(() => {
          if (!unMounted) {
            connect();
          }
        }, RECONNECT_TIMEOUT_MS);
      } else {
        Sentry.captureMessage(
          "EventSource can't establish a connection to the server.",
          {
            extra: {
              module: 'sse hook',
              name: 'Retry terminated',
            },
          }
        );

        callback({
          ALL: {
            status: 'ERROR',
            message:
              "EventSource can't establish a connection to the server. Connection retry terminated.",
          },
        });
      }
    };
    const handleOpen = () => {
      console.info('Open SSE connection');
      retryCount = 0;
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
      unMounted = true;
      console.info('Unmounting SSE hook');
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, onMessageEvent);
    };
  }, [eventName, es, callback, connect]);
}
