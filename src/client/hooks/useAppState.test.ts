import { act, renderHook } from '@testing-library/react-hooks';
import { PRISTINE_APPSTATE } from '../AppState';
import * as dataApiHook from './api/api.hook';
import * as tipsHook from './api/api.tips';
import { useAppState } from './useAppState';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';

describe('useAppState', () => {
  let onEventCallback: any;
  const stateSliceMock = { FOO: { content: { hello: 'world' } } };

  const useSSEMock = jest.fn(
    (endpoint, messageName, callback: (messageData: any) => void, postpone) => {
      onEventCallback = jest.fn(callback);
    }
  );
  const fetchTips = jest.fn();
  const fetchSauron = jest.fn();

  // @ts-ignore
  const useTipsApi = (tipsHook.useTipsApi = jest.fn(() => {
    return { TIPS: { status: 'PRISTINE', content: null }, fetch: fetchTips };
  }));

  // @ts-ignore
  const useSSE = (sseHook.useSSE = useSSEMock);
  // @ts-ignore
  const useDataApi = (dataApiHook.useDataApi = jest.fn());

  useDataApi.mockReturnValue([
    {
      isLoading: false,
      isError: false,
      data: null,
      isPristine: true,
      isDirty: false,
    },
    fetchSauron,
  ]);

  const initialAppState = Object.assign({}, PRISTINE_APPSTATE, {
    controller: { TIPS: { fetch: fetchTips } },
  });

  beforeEach(() => {
    fetchTips.mockClear();
    fetchSauron.mockClear();
    useDataApi.mockClear();
    useTipsApi.mockClear();
    useSSE.mockClear();
  });

  it('Should start with the SSE endpoint', async () => {
    (window as any).EventSource = true;
    const { result } = renderHook(() => useAppState());

    expect(result.current).toEqual(initialAppState);

    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);

    // trigger the state update
    act(() => {
      onEventCallback(stateSliceMock);
    });

    expect(useDataApi).toBeCalledTimes(2);
    expect(useSSE).toBeCalledTimes(2);

    expect(fetchSauron).toBeCalledTimes(0);

    expect(result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should start with the Sauron endpoint for browsers that do not have window.EventSource', () => {
    delete (window as any).EventSource;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchSauron).toBeCalledTimes(1);
  });

  it('Should use Sauron endpoint if EventSource fails to connect', async () => {
    (window as any).EventSource = true;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchSauron).toBeCalledTimes(0);

    useDataApi.mockReturnValueOnce([
      {
        isLoading: false,
        isError: false,
        data: stateSliceMock,
        isPristine: true,
        isDirty: false,
      },
      fetchSauron,
    ]);

    act(() => {
      onEventCallback(SSE_ERROR_MESSAGE);
    });

    expect(fetchSauron).toBeCalledTimes(1);

    // Rendered again because setState to use sauron triggers update and then again when fetchSauron triggers a setState call
    expect(useDataApi).toBeCalledTimes(3);
    expect(useSSE).toBeCalledTimes(3);

    expect(appState.result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should respond with an appState error entry if Sauron and SSE both fail.', async () => {
    (window as any).EventSource = true;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchSauron).toBeCalledTimes(0);

    useDataApi.mockReturnValueOnce([
      {
        isLoading: false,
        isError: true,
        data: null,
        isPristine: true,
        isDirty: false,
      },
      fetchSauron,
    ]);

    act(() => {
      onEventCallback(SSE_ERROR_MESSAGE);
    });

    expect(fetchSauron).toBeCalledTimes(1);

    // Rendered again because setState to use sauron triggers update and then again when fetchSauron triggers a setState call
    expect(useDataApi).toBeCalledTimes(3);
    expect(useSSE).toBeCalledTimes(3);

    expect(appState.result.current).toEqual(
      Object.assign({}, initialAppState, {
        ALL: {
          status: 'ERROR',
          message:
            'Services.all endpoint could not be reached or returns an error. Sauron fallback enabled.',
        },
      })
    );
  });
});
