import { act, renderHook } from '@testing-library/react-hooks';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';

interface SSEMessage {
  data: string;
}

const evHandlers: Record<string, (args: any) => void> = {};
const sseMockResponse = JSON.stringify({
  FOO: { content: { hello: 'world' } },
});

function EventSourceMock() {
  // @ts-ignore
  this.init();
}

EventSourceMock.prototype.init = jest.fn();
EventSourceMock.prototype.readyState = 'x';
EventSourceMock.prototype.close = jest.fn();
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
  (window as any).EventSource = EventSourceMock;
  // @ts-ignore
  sseHook.MAX_RETRY_COUNT = 4;

  beforeAll(() => {
    (window as any).console.info = jest.fn();
    (window as any).console.error = jest.fn();
  });

  afterAll(() => {
    (window as any).console.info.mockRestore();
    (window as any).console.error.mockRestore();
  });

  beforeEach(() => {
    EventSourceMock.prototype.init.mockClear();
    EventSourceMock.prototype.close.mockClear();
    EventSourceMock.prototype.addEventListener.mockClear();
    EventSourceMock.prototype.removeEventListener.mockClear();
    onEventCallback.mockClear();
    jest.useFakeTimers();
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
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(4);

    act(() => {
      evHandlers.message({ data: sseMockResponse });
    });

    expect(onEventCallback).toHaveBeenCalledWith(JSON.parse(sseMockResponse));

    hook.unmount();

    expect(EventSourceMock.prototype.removeEventListener).toHaveBeenCalledTimes(
      4
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
    expect(EventSourceMock.prototype.addEventListener).toHaveBeenCalledTimes(4);

    // First try
    act(() => {
      evHandlers.error(new Error('Server not reachable.'));
    });
    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(1);
    jest.runAllTimers();
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(2);

    // Second try
    act(() => {
      evHandlers.error(new Error('Server not reachable.'));
    });
    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(2);
    jest.runAllTimers();
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(3);

    // Third try
    act(() => {
      evHandlers.error(new Error('Server not reachable.'));
    });
    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(3);
    jest.runAllTimers();
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(3);

    // Fourth, last try
    act(() => {
      evHandlers.error(new Error('Server not reachable.'));
    });
    expect(EventSourceMock.prototype.close).toHaveBeenCalledTimes(4);
    jest.runAllTimers();

    // Init is not called again
    expect(EventSourceMock.prototype.init).toHaveBeenCalledTimes(3);

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
});
