import { act } from 'react';

import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  useBffApi,
  sendGetRequest,
  sendJSONPostRequest,
  sendFormPostRequest,
  isAborted,
  HttpStatusCode,
} from './useBffApi';

describe('useBffApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with pristine state', () => {
    const { result } = renderHook(() =>
      useBffApi('test-key', { fetchImmediately: false })
    );
    expect(result.current).toStrictEqual({
      isPristine: true,
      isDirty: false,
      isLoading: false,
      isError: false,
      data: null,
      errorData: null,
      fetch: expect.any(Function),
    });
  });

  it('should throw error if key is used without url and fetchImmediately is not false', () => {
    expect(() => renderHook(() => useBffApi('missing-url-key'))).toThrow(
      'When using a key, you must provide a URL in the options parameter or set fetchImmediately to false'
    );
  });

  it('should not fetch immediately when fetchImmediately is false', () => {
    const fetchSpy = vi.fn();
    renderHook(() =>
      useBffApi('no-fetch-key', {
        url: 'http://localhost/test',
        fetchImmediately: false,
        sendRequest: fetchSpy,
      })
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should fetch immediately when fetchImmediately is true', async () => {
    const mockResponse = { status: 'OK', content: { foo: 'bar' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );
    const { result } = renderHook(() =>
      useBffApi('immediate-key', {
        url: 'http://localhost/test',
        fetchImmediately: true,
      })
    );
    // Wait for effect to finish
    await act(async () => {});
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isPristine).toBe(false);
  });

  it('should handle non-enveloped response', async () => {
    const mockResponse = { foo: 'bar' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );
    const { result } = renderHook(() =>
      useBffApi('non-envelope-key', { fetchImmediately: false })
    );
    await act(async () => {
      await result.current.fetch('http://localhost/test');
    });
    expect(result.current.data).toEqual({
      status: 'OK',
      content: mockResponse,
    });
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should fetch data successfully', async () => {
    const mockResponse = { status: 'OK', content: { foo: 'bar' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const { result } = renderHook(() =>
      useBffApi('test-key', { fetchImmediately: false })
    );

    await act(async () => {
      result.current.fetch('http://localhost/test');
    });

    expect(result.current).toStrictEqual({
      isPristine: false,
      isDirty: true,
      isLoading: false,
      isError: false,
      data: mockResponse,
      errorData: null,
      fetch: expect.any(Function),
    });
  });

  it('should handle error response', async () => {
    const mockResponse = { status: 'ERROR', message: 'Failed' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const { result } = renderHook(() =>
      useBffApi('error-key', { fetchImmediately: false })
    );

    await act(async () => {
      result.current.fetch('http://localhost/test');
    });

    expect(result.current).toStrictEqual({
      isPristine: false,
      isLoading: false,
      isError: true,
      isDirty: true,
      data: null,
      errorData:
        'HTTP Error: Request to http://localhost/test failed with status 500 message: Failed',
      fetch: expect.any(Function),
    });
  });

  it('should handle fetch abort using AbortController', async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          if (signal.aborted) {
            reject(signal.reason);
            return;
          }
          signal.addEventListener('abort', () => {
            reject(signal.reason);
          });
        });
      })
    );

    const { result } = renderHook(() =>
      useBffApi('abort-key', { fetchImmediately: false })
    );

    act(() => {
      controller.abort('Stop now!');
    });

    await act(async () => {
      await result.current.fetch('http://localhost/test', { signal });
    });

    expect(result.current).toStrictEqual({
      isPristine: false,
      isDirty: true,
      isLoading: false,
      isError: true,
      data: null,
      errorData: 'Unknown error: Stop now!',
      fetch: expect.any(Function),
    });
  });
});

describe('sendGetRequest', () => {
  it('should return success result', async () => {
    const mockResponse = { status: 'OK', content: { foo: 'bar' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const result = await sendGetRequest<{ foo: string }>(
      'http://localhost/test'
    );
    expect(result.status).toBe('OK');
    expect(result.content).toEqual({ foo: 'bar' });
  });

  it('should return error result', async () => {
    const mockResponse = { status: 'ERROR', message: 'Failed', content: null };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const result = await sendGetRequest('http://localhost/test');
    expect(result.status).toBe('ERROR');
    expect(result.status === 'ERROR' && result.message).toContain('HTTP Error');
  });
});

describe('sendJSONPostRequest', () => {
  it('should send JSON and return success', async () => {
    const mockResponse = { status: 'OK', content: { foo: 'bar' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const result = await sendJSONPostRequest<{ foo: string }>(
      'http://localhost/test',
      { foo: 'bar' }
    );
    expect(result.status).toBe('OK');
    expect(result.content).toEqual({ foo: 'bar' });
  });
});

describe('sendFormPostRequest', () => {
  it('should send form data and return success', async () => {
    const mockResponse = { status: 'OK', content: { foo: 'bar' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        url: 'http://localhost/test',
        json: async () => mockResponse,
      })
    );

    const result = await sendFormPostRequest<{ foo: string }>(
      'http://localhost/test',
      { foo: 'bar' }
    );
    expect(result.status).toBe('OK');
    expect(result.content).toEqual({ foo: 'bar' });
  });
});

describe('isAborted', () => {
  it('should detect abort error', () => {
    expect(isAborted(new Error('AbortError: The operation was aborted.'))).toBe(
      true
    );
    expect(isAborted(new Error('Some other error'))).toBe(false);
  });
});

describe('HttpStatusCode', () => {
  it('should have correct status codes', () => {
    expect(HttpStatusCode.Ok).toBe(200);
    expect(HttpStatusCode.BadRequest).toBe(400);
    expect(HttpStatusCode.InternalServerError).toBe(500);
  });
});
