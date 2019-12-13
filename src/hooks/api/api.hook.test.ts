import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getDefaultState, useDataApi } from './api.hook';

const DUMMY_RESPONSE = { foo: 'bar' };
const DUMMY_URL = 'http://test';

describe('Api hook', () => {
  const axMock = new MockAdapter(axios);

  axMock.onGet(DUMMY_URL).reply(200, DUMMY_RESPONSE);

  it('should have a default state', () => {
    const { result } = renderHook(() => useDataApi());
    expect(result.current[0]).toEqual(getDefaultState());
  });

  it('should postpone immediate fetching', () => {
    const { result } = renderHook(() =>
      useDataApi({
        url: '',
        postpone: true,
      })
    );
    const state = { ...getDefaultState(), isLoading: false };
    expect(result.current[0]).toEqual(state);
  });

  it('should make http request and update api state', async () => {
    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useDataApi(options));

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
    const { result, waitForNextUpdate } = renderHook(() => useDataApi(options));

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitForNextUpdate();

    expect(result.current[0].isError).toBe(true);
  });
});
