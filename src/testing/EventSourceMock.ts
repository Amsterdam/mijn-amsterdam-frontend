export function newEventSourceMock() {
  function EventSourceMock() {
    // @ts-ignore
    this.init();
  }

  EventSourceMock.CONNECTING = 0;
  EventSourceMock.OPEN = 1;
  EventSourceMock.CLOSED = 2;
  EventSourceMock.prototype.readyState = 0;
  EventSourceMock.prototype.init = vi.fn();
  EventSourceMock.prototype.setReadyState = function (readyState: number) {
    this.readyState = readyState;
  };
  EventSourceMock.prototype.open = vi.fn(() => {
    EventSourceMock.prototype.evHandlers?.open();
  });
  EventSourceMock.prototype.close = vi.fn(() => {
    EventSourceMock.prototype.evHandlers?.close();
  });
  EventSourceMock.prototype.error = vi.fn((error: any) => {
    EventSourceMock.prototype.evHandlers?.error(error);
  });
  EventSourceMock.prototype.addEventListener = vi.fn(
    (eventName: string, handler: (args: any) => void) => {
      EventSourceMock.prototype.evHandlers[eventName] = vi.fn(handler);
    }
  );
  EventSourceMock.prototype.removeEventListener = vi.fn(
    (eventName: string, _handler: () => void) => {
      delete EventSourceMock.prototype.evHandlers[eventName];
    }
  );
  EventSourceMock.prototype.evHandlers = {};
  return EventSourceMock;
}
