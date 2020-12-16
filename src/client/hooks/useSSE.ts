import { useCallback, useEffect, useState, useRef } from 'react';
export const SSE_ERROR_MESSAGE = 'sse-error';

export const MAX_CONNECTION_RETRY_COUNT = 5;

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
  const [es, setEs] = useState<EventSource | null>(null);
  const connectionCounter = useRef(0);

  const connect = useCallback((path, requestParams) => {
    const es = new EventSource(
      path + (requestParams ? '?' + new URLSearchParams(requestParams) : '')
    );
    setEs(es);
  }, []);

  useEffect(() => {
    if (!postpone) {
      connect(path, requestParams);
    }
  }, [path, connect, postpone, requestParams]);

  useEffect(() => {
    if (!es) {
      return;
    }

    const handleOpen = () => {
      console.info('[SSE] Open connection', connectionCounter.current);
      connectionCounter.current += 1;
    };

    const closeEventSource = () => {
      console.info('[SSE] Close connection', connectionCounter.current);
      connectionCounter.current = 0;
      es.close();
    };

    const handleError = (error: any) => {
      console.info('[SSE] Error connecting', es.readyState);

      if (
        EventSource.CONNECTING === es.readyState &&
        connectionCounter.current >= MAX_CONNECTION_RETRY_COUNT
      ) {
        closeEventSource();
        callback(SSE_ERROR_MESSAGE);
      }
    };

    const onMessageEvent = (message: any) => {
      if (message.lastEventId === 'close') {
        closeEventSource();
        return;
      }

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
    es.addEventListener(eventName, onMessageEvent);

    // This listener is here because Sentry reports back errors of interrupted connections whilst the page is being refreshed.
    // If we close the event source before the unload Sentry stays calm.
    window.addEventListener('beforeunload', closeEventSource);

    return () => {
      console.info('[SSE] Unmounting hook');
      es.removeEventListener('error', handleError);
      es.removeEventListener('open', handleOpen);
      es.removeEventListener(eventName, onMessageEvent);

      window.removeEventListener('beforeunload', closeEventSource);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [es]);
}
