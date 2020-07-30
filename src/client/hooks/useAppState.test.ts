import { act, renderHook } from '@testing-library/react-hooks';
import { PRISTINE_APPSTATE } from '../AppState';
import * as dataApiHook from './api/useDataApi';
import * as tipsHook from './api/useTipsApi';
import { useAppState } from './useAppState';
import * as sseHook from './useSSE';
import { SSE_ERROR_MESSAGE } from './useSSE';
import * as recoil from 'recoil';
import * as profileTypeHook from './useProfileType';

describe('useAppState', () => {
  let onEventCallback: any;
  const stateSliceMock = { FOO: { content: { hello: 'world' } } };
  const initialAppState = PRISTINE_APPSTATE;

  const useSSEMock = jest.fn(
    (endpoint, messageName, callback: (messageData: any) => void, postpone) => {
      onEventCallback = jest.fn(callback);
    }
  );
  const fetchTips = jest.fn();
  const fetchFallbackService = jest.fn();

  let appData: any = initialAppState;
  const setAppState = jest.fn(data => {
    appData = data(appData);
  });
  const useRecoilStateMock = jest.fn(() => [appData, setAppState]);
  const useProfileTypeMock = jest.fn(() => ['private']);

  // @ts-ignore
  const useTipsApi = (tipsHook.useTipsApi = jest.fn(() => {
    return { TIPS: { status: 'PRISTINE', content: null }, fetch: fetchTips };
  }));

  // @ts-ignore
  const useProfileType = (profileTypeHook.useProfileType = useProfileTypeMock);
  // @ts-ignore
  const useRecoilState = (recoil.useRecoilState = useRecoilStateMock);
  // @ts-ignore
  const useSSE = (sseHook.useSSE = useSSEMock);
  // @ts-ignore
  const useDataApi = (dataApiHook.useDataApi = jest.fn());
  // @ts-ignore
  const pollBffHealth = (dataApiHook.pollBffHealth = jest.fn());

  useDataApi.mockReturnValue([
    {
      isLoading: false,
      isError: false,
      data: null,
      isPristine: true,
      isDirty: false,
    },
    fetchFallbackService,
  ]);

  beforeAll(() => {
    (window as any).console.info = jest.fn();
    (window as any).console.error = jest.fn();
  });

  afterAll(() => {
    (window as any).console.info.mockRestore();
    (window as any).console.error.mockRestore();
  });

  beforeEach(() => {
    appData = initialAppState;
    fetchTips.mockClear();
    fetchFallbackService.mockClear();
    useDataApi.mockClear();
    useTipsApi.mockClear();
    useSSE.mockClear();
    pollBffHealth.mockClear();
    useRecoilState.mockClear();
    useProfileType.mockClear();
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

    expect(setAppState).toBeCalledTimes(1);

    expect(fetchFallbackService).toBeCalledTimes(0);

    expect(appData).toEqual(Object.assign({}, initialAppState, stateSliceMock));
  });

  it('Should start with the Fallback service endpoint for browsers that do not have window.EventSource', () => {
    delete (window as any).EventSource;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchFallbackService).toBeCalledTimes(1);
  });

  it('Should use Fallback service endpoint if EventSource fails to connect', async () => {
    (window as any).EventSource = true;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchFallbackService).toBeCalledTimes(0);

    useDataApi.mockReturnValueOnce([
      {
        isLoading: false,
        isError: false,
        data: stateSliceMock,
        isPristine: true,
        isDirty: false,
      },
      fetchFallbackService,
    ]);

    pollBffHealth.mockResolvedValueOnce('ok');

    act(() => {
      onEventCallback(SSE_ERROR_MESSAGE);
    });

    await expect(pollBffHealth).toHaveBeenCalled();

    expect(fetchFallbackService).toBeCalledTimes(1);

    expect(useDataApi).toBeCalledTimes(3);
    expect(useSSE).toBeCalledTimes(3);

    expect(appState.result.current).toEqual(
      Object.assign({}, initialAppState, stateSliceMock)
    );
  });

  it('Should respond with an appState error entry if Fallback service and SSE both fail.', async () => {
    (window as any).EventSource = true;
    const appState = renderHook(() => useAppState());

    expect(appState.result.current).toEqual(initialAppState);
    expect(useDataApi).toBeCalledTimes(1);
    expect(useSSE).toBeCalledTimes(1);
    expect(fetchFallbackService).toBeCalledTimes(0);

    useDataApi.mockReturnValue([
      {
        isLoading: false,
        isError: true,
        data: null,
        isPristine: true,
        isDirty: false,
      },
      fetchFallbackService,
    ]);

    pollBffHealth.mockRejectedValue('nok');

    act(() => {
      onEventCallback(SSE_ERROR_MESSAGE);
    });

    await expect(pollBffHealth).toHaveBeenCalled();

    expect(fetchFallbackService).toBeCalledTimes(0);

    // Rendered again because setState to use Fallback service triggers update and then again when fetchFallbackService triggers a setState call
    expect(useDataApi).toBeCalledTimes(3);
    expect(useSSE).toBeCalledTimes(3);

    expect(appState.result.current).toEqual(
      Object.assign({}, initialAppState, {
        ALL: {
          status: 'ERROR',
          message:
            'Services.all endpoint could not be reached or returns an error. Fallback service fallback enabled.',
        },
      })
    );
  });
});
