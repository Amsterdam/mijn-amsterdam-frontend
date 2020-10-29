import { useCallback, useEffect, useState } from 'react';

let connectionCounter = 0;
const WAIT_MS_BEFORE_RETRY = 2000;
export const MAX_RETRY_COUNT = 4;
export const SSE_ERROR_MESSAGE = 'sse-error';

interface useSSEProps {
  path: string;
  eventName: string;
  callback: (message: any) => void;
  postpone: boolean;
  requestParams?: Record<string, string | string[]>;
}

export function useSSE({
  path,
  eventName,
  callback,
  postpone,
  requestParams,
}: useSSEProps) {
  const [es, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback((path, requestParams) => {
    const es = new EventSource(
      path + (requestParams ? '?' + new URLSearchParams(requestParams) : '')
    );
    connectionCounter += 1;
    console.info('[SSE] Connect ', connectionCounter);
    setEventSource(es);
  }, []);

  // Connecting to the EventSource.
  useEffect(() => {
    if (!postpone && connectionCounter !== MAX_RETRY_COUNT) {
      connect(path, requestParams);
    }
  }, [path, connect, postpone, requestParams]);

  useEffect(() => {
    if (!es) {
      return;
    }

    const handleError = (error: any) => {
      console.info('[SSE] Error connecting');

      es.close();

      setTimeout(() => {
        if (connectionCounter !== MAX_RETRY_COUNT) {
          connect(path, requestParams);
        }
      }, WAIT_MS_BEFORE_RETRY);

      if (connectionCounter === MAX_RETRY_COUNT) {
        console.error(
          `[SSE] can't establish connection after ${connectionCounter} tries.`
        );
        callback(SSE_ERROR_MESSAGE);
      }
    };

    const handleOpen = () => {
      console.info('[SSE] Open connection');
    };

    const closeEventSource = () => {
      console.info('[SSE] Close connection');
      es.close();
      // After an explicit close event we can safely reset the connection counter.
      connectionCounter = 0;
    };

    const onMessageEvent = (message: any) => {
      let messageData = SSE_ERROR_MESSAGE;
      try {
        messageData = JSON.parse(message.data);
      } catch (error) {
        console.error('[SSE] Parsing sse message data failed.');
      }
      callback(messageData);
    };

    es.addEventListener('error', handleError);
    es.addEventListener('open', handleOpen);
    es.addEventListener('close', closeEventSource);
    es.addEventListener(eventName, onMessageEvent);

    return () => {
      console.info('[SSE] Unmounting hook');
      if (
        es.readyState === EventSource.OPEN ||
        es.readyState === EventSource.CONNECTING
      ) {
        es.close();
      }
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener('close', closeEventSource);
      es.removeEventListener(eventName, onMessageEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [es]);
}
