import { render, screen } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { MainFooter } from './MainFooter';
import { bffApi } from '../../../testing/utils';

export function mockFooterRequest() {
  bffApi.get('/services/cms/footer').reply(200, {
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
  });
}

describe('<MainFooter />', () => {
  test('Renders without crashing', async () => {
    mockFooterRequest();

    render(<MainFooter />);

    expect(await screen.findByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Another Section')).toBeInTheDocument();
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByText('Test Link 2')).toBeInTheDocument();
    expect(screen.getByText('Test Link 3')).toBeInTheDocument();
  });
});
