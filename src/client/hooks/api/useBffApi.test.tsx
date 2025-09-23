import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBffApi } from './useBffApi';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { C } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';

const TestComponent = () => {
  const api1 = useBffApi('key1', { fetchImmediately: false });
  const api2 = useBffApi('key2', { fetchImmediately: false });

  return (
    <div data-testid="test-component">
      <button onClick={() => api1.fetch('http://localhost/api1')}>
        Fetch API 1
      </button>
      <button onClick={() => api2.fetch('http://localhost/api2')}>
        Fetch API 2
      </button>
      <div data-testid="api1-data">
        {api1.data ? JSON.stringify(api1.data) : 'No data'}
      </div>
      <div data-testid="api2-data">
        {api2.data ? JSON.stringify(api2.data) : 'No data'}
      </div>
    </div>
  );
};

describe('useBffApi in a component', () => {
  it('should fetch data from two separate URLs', async () => {
    const mockResponse1 = { status: 'OK', content: { foo: 'bar1' } };
    const mockResponse2 = { status: 'OK', content: { foo: 'bar2' } };

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse2,
        })
    );

    const result = render(<TestComponent />);

    const fetchApi1Button = screen.getByText('Fetch API 1');
    const fetchApi2Button = screen.getByText('Fetch API 2');

    await act(async () => {
      fetchApi1Button.click();
    });

    expect(screen.getByTestId('api1-data').textContent).toBe(
      JSON.stringify(apiSuccessResult(mockResponse1.content))
    );
    expect(screen.getByTestId('api2-data').textContent).toBe('No data');

    await act(async () => {
      fetchApi2Button.click();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(screen.getByTestId('api2-data').textContent).toBe(
      JSON.stringify(apiSuccessResult(mockResponse2.content))
    );

    expect(screen.queryByTestId('test-component')).not.toBeNull();
    result.unmount();
    expect(screen.queryByTestId('test-component')).toBeNull();

    // Uses cached result from api1 and api2
    render(<TestComponent />);

    expect(screen.queryByTestId('test-component')).not.toBeNull();

    expect(global.fetch).toHaveBeenCalledTimes(2);

    expect(screen.getByTestId('api1-data').textContent).toBe(
      JSON.stringify(apiSuccessResult(mockResponse1.content))
    );
    expect(screen.getByTestId('api2-data').textContent).toBe(
      JSON.stringify(apiSuccessResult(mockResponse2.content))
    );
  });
});
