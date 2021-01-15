import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ChapterMenuItem } from '../../config/menuItems';
import MyChaptersPanel from './MyChaptersPanel';

const PANEL_TITLE = 'whoa!';
const items: ChapterMenuItem[] = [
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

describe('Chapter panel display', () => {
  it('Renders chapter items', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MyChaptersPanel
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
          <MyChaptersPanel
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
