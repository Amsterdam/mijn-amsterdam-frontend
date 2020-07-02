import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useState } from 'react';

let connectionCounter = 0;
const WAIT_MS_BEFORE_RETRY = 2000;
export const MAX_RETRY_COUNT = 4;
export const SSE_ERROR_MESSAGE = 'sse-error';

export function useSSE(
  path: string,
  eventName: string,
  callback: (message: any) => void,
  postpone: boolean
) {
  const [es, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource(path);
    connectionCounter += 1;
    console.info('Connecting to SSE', connectionCounter);
    setEventSource(es);
  }, [path]);

  useEffect(() => {
    if (!es && !postpone && connectionCounter !== MAX_RETRY_COUNT) {
      connect();
    }
  }, [es, connect, postpone]);

  useEffect(() => {
    if (!es || postpone) {
      return;
    }

    const handleError = (error: any) => {
      console.info('Error in SSE connection');

      es.close();

      setTimeout(() => {
        if (connectionCounter !== MAX_RETRY_COUNT) {
          connect();
        }
      }, WAIT_MS_BEFORE_RETRY);

      if (connectionCounter === MAX_RETRY_COUNT) {
        const errorMessage = `EventSource can't establish a connection to the server after ${connectionCounter} tries.`;
        Sentry.captureMessage(errorMessage);

        callback(SSE_ERROR_MESSAGE);
      }
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
  }, [eventName, es, callback, connect, postpone]);
}
