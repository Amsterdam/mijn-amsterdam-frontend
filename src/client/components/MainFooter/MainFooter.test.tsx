import { render } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { bffApi } from '../../../testing/utils.ts';
import * as Erfpacht from '../../apps/bob/pages/Thema/Erfpacht/useErfpachtThemaData.hook.tsx';
import { MainFooter } from './MainFooter.tsx';

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

vi.spyOn(Erfpacht, 'useErfpachtThemaData').mockImplementation(
  () =>
    ({
      relatieCode: '123',
      // biome-ignore lint/suspicious/noExplicitAny: Preserve the existing lint exception.
    }) as any
);

describe('<MainFooter />', () => {
  test('Renders without crashing', async () => {
    mockFooterRequest();

    const screen = render(<MainFooter />);
    expect(await screen.findByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Another Section')).toBeInTheDocument();
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByText('Test Link 2')).toBeInTheDocument();
  });

  test('Renders custom footer link from canonmatiging', async () => {
    mockFooterRequest();

    const screen = render(<MainFooter />);
    expect(
      await screen.findByText('Mogelijke terugbetaling bij verhuur')
    ).toBeInTheDocument();
  });
});
