import { act, render, screen } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { MainFooter } from './MainFooter';
import { createFetchResponse } from '../../../testing/utils';

describe('<MainFooter />', () => {
  const fetch_ = global.fetch;

  afterAll(() => {
    global.fetch = fetch_;
  });

  test('Renders without crashing', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(
      createFetchResponse({
        content: {
          sections: [
            {
              title: 'Test Section',
              links: [{ label: 'Test Link', url: '/test' }],
            },
            {
              title: 'Another Section',
              links: [{ label: 'Test Link 2', url: '/test' }],
            },
          ],
          bottomLinks: [
            {
              label: 'Test Link 3',
              url: '/test',
            },
          ],
        },
        status: 'OK',
      })
    );
    await act(() => render(<MainFooter />));
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Another Section')).toBeInTheDocument();
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByText('Test Link 2')).toBeInTheDocument();
    expect(screen.getByText('Test Link 3')).toBeInTheDocument();
  });
});
