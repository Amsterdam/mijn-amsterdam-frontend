import { act, renderHook } from '@testing-library/react-hooks';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE, MAX_CONNECTION_RETRY_COUNT } from './useSSE';
import { init } from '@sentry/node';

const evHandlers: Record<string, (args?: any) => void> = {};
const sseMockResponse = JSON.stringify({
  FOO: { content: { hello: 'world' } },
});

function EventSourceMock() {
  // @ts-ignore
  this.init();
}

EventSourceMock.CONNECTING = 0;
EventSourceMock.OPEN = 1;
EventSourceMock.CLOSED = 2;
EventSourceMock.prototype.readyState = 0;
EventSourceMock.prototype.mockRestore = () => {
  [
    'init',
    'open',
    'close',
    'error',
    'addEventListener',
    'removeEventListener',
  ].forEach(name => {
    EventSourceMock.prototype[name].mockClear();
  });
  EventSourceMock.prototype.readyState = 0;
};
EventSourceMock.prototype.init = jest.fn(function init() {});
EventSourceMock.prototype.setReadyState = function(readyState: number) {
  this.readyState = readyState;
};
EventSourceMock.prototype.open = jest.fn(() => {
  evHandlers.open && evHandlers.open();
});
EventSourceMock.prototype.close = jest.fn(() => {
  evHandlers.close && evHandlers.close();
});
EventSourceMock.prototype.error = jest.fn((error: any) => {
  evHandlers.error && evHandlers.error(error);
});
EventSourceMock.prototype.addEventListener = jest.fn(
  (eventName: string, handler: (args: any) => void) => {
    evHandlers[eventName] = jest.fn(handler);
  }
);
EventSourceMock.prototype.removeEventListener = jest.fn(
  (eventName: string, handler: () => void) => {
    delete evHandlers[eventName];
  }
);

const onEventCallback = jest.fn();

describe('useAppState', () => {
  beforeAll(() => {
    (window as any).EventSource = EventSourceMock;
    (window as any).console.info = jest.fn();
    (window as any).console.error = jest.fn();
  });

  afterAll(() => {
    (window as any).console.info.mockRestore();
    (window as any).console.error.mockRestore();
  });

  beforeEach(() => {
    EventSourceMock.prototype.mockRestore();
    onEventCallback.mockClear();
  });

  it('Should connect and respond with multiple messages.', () => {
    const hook = renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );
    expect(EventSourceMock.prototype.init).toHaveBeenCalled();
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(3);

    act(() => {
      evHandlers.message({ data: sseMockResponse });
    });

    expect(onEventCallback).toHaveBeenCalledWith(JSON.parse(sseMockResponse));

    hook.unmount();

    expect(EventSourceMock.prototype.removeEventListener).toHaveBeenCalledTimes(
      3
    );
  });

  it('Should connect fail, retry and respond with an error.', async () => {
    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(1);
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(3);

    // Simulate retries
    for (let i = 0; i < MAX_CONNECTION_RETRY_COUNT; i += 1) {
      EventSourceMock.prototype.open();
      expect(evHandlers.open).toHaveBeenCalledTimes(i + 1);

      EventSourceMock.prototype.error(new Error('Server not reachable.'));
      expect(evHandlers.error).toHaveBeenCalledTimes(i + 1);
    }

    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(1);
    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });

  it('Should not connect if postponed.', () => {
    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: true,
      })
    );

    // First try
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(0);
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(0);
  });

  it('Should fail immediately if connection is closed but with error.', () => {
    EventSourceMock.prototype.readyState = 2;

    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    EventSourceMock.prototype.error(new Error('Server not reachable.'));

    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(1);
    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });

  it('Should fail immediately if connection is open but with error.', () => {
    EventSourceMock.prototype.readyState = 1;

    renderHook(() =>
      sseHook.useSSE({
        path: 'http://mock-sse',
        eventName: 'message',
        callback: onEventCallback,
        postpone: false,
      })
    );

    EventSourceMock.prototype.error(new Error('Server not reachable.'));

    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(1);
    expect(onEventCallback).toHaveBeenCalledWith(SSE_ERROR_MESSAGE);
  });
});
