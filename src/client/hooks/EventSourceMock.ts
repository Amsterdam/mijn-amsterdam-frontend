export function newEventSourceMock() {
  function EventSourceMock() {
    // @ts-ignore
    this.init();
  }

  EventSourceMock.CONNECTING = 0;
  EventSourceMock.OPEN = 1;
  EventSourceMock.CLOSED = 2;
  EventSourceMock.prototype.readyState = 0;
  EventSourceMock.prototype.init = jest.fn();
  EventSourceMock.prototype.setReadyState = function (readyState: number) {
    this.readyState = readyState;
  };
  EventSourceMock.prototype.open = jest.fn(() => {
    EventSourceMock.prototype.evHandlers.open &&
      EventSourceMock.prototype.evHandlers.open();
  });
  EventSourceMock.prototype.close = jest.fn(() => {
    EventSourceMock.prototype.evHandlers.close &&
      EventSourceMock.prototype.evHandlers.close();
  });
  EventSourceMock.prototype.error = jest.fn((error: any) => {
    EventSourceMock.prototype.evHandlers.error &&
      EventSourceMock.prototype.evHandlers.error(error);
  });
  EventSourceMock.prototype.addEventListener = jest.fn(
    (eventName: string, handler: (args: any) => void) => {
      EventSourceMock.prototype.evHandlers[eventName] = jest.fn(handler);
    }
  );
  EventSourceMock.prototype.removeEventListener = jest.fn(
    (eventName: string, handler: () => void) => {
      delete EventSourceMock.prototype.evHandlers[eventName];
    }
  );
  EventSourceMock.prototype.evHandlers = {};
  return EventSourceMock;
}
