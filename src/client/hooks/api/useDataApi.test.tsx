import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getDefaultState, useDataApi } from './useDataApi.ts';
import { bffApiHost } from '../../../testing/setup.ts';
import { bffApi } from '../../../testing/utils.ts';

interface ResponseData {
  foo: string;
}

type DummyResponse = Nullable<ResponseData>;

const DUMMY_RESPONSE: DummyResponse = { foo: 'bar' };
const DUMMY_URL = `${bffApiHost}/test`;

describe('Api hook', () => {
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
    bffApi.get('/test').reply(200, DUMMY_RESPONSE);

    const options = {
      url: DUMMY_URL,
      postpone: true,
    };

    const { result, rerender } = renderHook(() =>
      useDataApi<DummyResponse>(options, null)
    );

    expect(result.current[0].isLoading).toBe(false);
    expect(result.current[0].isDirty).toBe(false);
    expect(result.current[0].isPristine).toBe(true);

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitFor(async () => {
      expect(result.current[0].isLoading).toBe(true);
      expect(result.current[0].isDirty).toBe(false);
      expect(result.current[0].isPristine).toBe(true);

      await waitFor(() => {
        expect(result.current[0].data).toEqual(DUMMY_RESPONSE);
      });
    });
  });

  it('should make http request and throw an error', async () => {
    bffApi.get('/test').reply(500, 'Not worky!');

    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const { result, rerender } = renderHook(() =>
      useDataApi<DummyResponse>(options, null)
    );

    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitFor(() => {
      expect((result.current[0].data as any)?.message).toBe(
        'Request failed with status code 500'
      );
      expect(result.current[0].isError).toBe(true);
    });
  });

  it('should return initial data when no content is served from api', async () => {
    bffApi.get('/test').reply(204, '');

    const options = {
      url: DUMMY_URL,
      postpone: true,
    };
    const initialData = { foo: 'bar' };
    const { result, rerender } = renderHook(() =>
      useDataApi<DummyResponse>(options, initialData)
    );
    // make fetch call
    act(() => {
      result.current[1](options);
    });

    await waitFor(() => {
      expect(result.current[0].data).toBe(initialData);
    });
  });
});
