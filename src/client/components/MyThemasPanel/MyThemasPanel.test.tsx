import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import { MyThemasPanel } from './MyThemasPanel';
import { ThemaMenuItemTransformed } from '../../config/thema';

const PANEL_TITLE = 'whoa!';
const items: ThemaMenuItemTransformed[] = [
  {
    title: 'Belastingen',
    id: 'BELASTINGEN',
    to: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: 'Erfpacht',
    id: 'ERFPACHT',
    to: 'https://example.org/erfpachtdingen',
    rel: 'external',
    profileTypes: ['private'],
  },
];

describe('Thema panel display', () => {
  it('Renders thema items', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MyThemasPanel
            title={PANEL_TITLE}
            items={items}
            isLoading={false}
            trackCategory="track-test"
          />
        </BrowserRouter>
      </RecoilRoot>
    );
    expect(screen.getByText(PANEL_TITLE)).toBeInTheDocument();
    expect(screen.getByText('Belastingen')).toBeInTheDocument();
    expect(screen.getByText('Erfpacht')).toBeInTheDocument();
  });

  it('Displays content loading placeholder', () => {
    const { container } = render(
      <RecoilRoot>
        <BrowserRouter>
          <MyThemasPanel
            title={PANEL_TITLE}
            items={items}
            isLoading={true}
            trackCategory="track-test"
          />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(
      container.querySelector('[class*="LoadingContent"]')
    ).toBeInTheDocument();
  });
});
