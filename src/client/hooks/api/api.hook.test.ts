import { act, renderHook } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import { getDefaultState, useDataApi, requestApiData } from './api.hook';

interface Response {
  foo: string;
}

type DummyResponse = Nullable<Response>;

const DUMMY_RESPONSE: DummyResponse = { foo: 'bar' };
const DUMMY_URL = 'http://test';

describe('Api hook', () => {
  const axMock = new MockAdapter(requestApiData);

  axMock.onGet(DUMMY_URL).reply(200, DUMMY_RESPONSE);

  it('should have a default state', () => {
    const { result } = renderHook(() =>
      useDataApi<DummyResponse>(undefined, null)
    );
    expect(result.current[0]).toEqual(getDefaultState<DummyResponse>(null));
  });

  it('should postpone immediate fetching', () => {
    const { result } = renderHook(() =>
      useDataApi<DummyResponse>(
        {
          url: '',
          postpone: true,
        },
        null
      )
    );
    const state = {
      ...getDefaultState<DummyResponse>(null),
      isLoading: false,
    };
    expect(result.current[0]).toEqual(state);
  });

  it('should make http request and update api state', async () => {
    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useDataApi<DummyResponse>(options, null)
    );

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    expect(result.current[0].isLoading).toBe(true);
    expect(result.current[0].isDirty).toBe(false);
    expect(result.current[0].isPristine).toBe(true);

    await waitForNextUpdate();

    expect(result.current[0].isLoading).toBe(false);
    expect(result.current[0].isDirty).toBe(true);
    expect(result.current[0].isPristine).toBe(false);

    expect(result.current[0].data).toEqual(DUMMY_RESPONSE);
  });

  it('should make http request and throw an error', async () => {
    axMock.onGet(DUMMY_URL).networkError();

    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const { result, waitForNextUpdate } = renderHook(() =>
      useDataApi<DummyResponse>(options, null)
    );

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitForNextUpdate();

    expect(result.current[0].isError).toBe(true);
  });

  it('should return initial data when no content is served from api', async () => {
    axMock.onGet(DUMMY_URL).reply(204, '');

    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const initialData = { foo: 'bar' };
    const { result, waitForNextUpdate } = renderHook(() =>
      useDataApi<DummyResponse>(options, initialData)
    );
    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitForNextUpdate();

    expect(result.current[0].data).toBe(initialData);
  });
});
