import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { MyThemasPanel } from './MyThemasPanel';
import type { ThemaMenuItemTransformed } from '../../config/thema-types';

const items: ThemaMenuItemTransformed[] = [
  {
    title: 'Belastingen',
    id: 'BELASTINGEN',
    to: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
    profileTypes: ['private'],
    redactedScope: 'none',
  },
];

describe('Thema panel display', () => {
  it('Renders thema items', () => {
    render(
      <BrowserRouter>
        <MyThemasPanel items={items} isLoading={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('Belastingen')).toBeInTheDocument();
    expect(
      screen.getByText('Dit ziet u in Mijn Amsterdam')
    ).toBeInTheDocument();
  });

  it('Displays content loading placeholder', () => {
    const { container } = render(
      <BrowserRouter>
        <MyThemasPanel items={items} isLoading={true} />
      </BrowserRouter>
    );

    expect(
      container.querySelector('[class*="LoadingContent"]')
    ).toBeInTheDocument();
  });
});
