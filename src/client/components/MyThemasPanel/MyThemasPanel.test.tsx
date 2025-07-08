import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { RecoilRoot } from 'recoil';

import { MyThemasPanel } from './MyThemasPanel.tsx';
import type { ThemaMenuItemTransformed } from '../../config/thema-types.ts';

const items: ThemaMenuItemTransformed[] = [
  {
    title: 'Belastingen',
    id: 'BELASTINGEN',
    to: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
    profileTypes: ['private'],
  },
];

describe('Thema panel display', () => {
  it('Renders thema items', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MyThemasPanel items={items} isLoading={false} />
        </BrowserRouter>
      </RecoilRoot>
    );
    expect(screen.getByText('Belastingen')).toBeInTheDocument();
    expect(
      screen.getByText('Dit ziet u in Mijn Amsterdam')
    ).toBeInTheDocument();
  });

  it('Displays content loading placeholder', () => {
    const { container } = render(
      <RecoilRoot>
        <BrowserRouter>
          <MyThemasPanel items={items} isLoading />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(
      container.querySelector('[class*="LoadingContent"]')
    ).toBeInTheDocument();
  });
});
