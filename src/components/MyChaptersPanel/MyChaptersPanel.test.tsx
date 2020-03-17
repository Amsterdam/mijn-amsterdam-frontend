import React from 'react';
import { shallow, mount } from 'enzyme';
import MyChaptersPanel from './MyChaptersPanel';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import { BrowserRouter } from 'react-router-dom';

const PANEL_TITLE = 'whoa!';
const items: MenuItem[] = [
  {
    title: 'Belastingen',
    id: 'BELASTINGEN',
    to: 'https://belastingbalie.amsterdam.nl/digid.saml.php?start',
    rel: 'external',
  },
  {
    title: 'Erfpacht',
    id: 'WONEN',
    to: 'https://example.org/erfpachtdingen',
    rel: 'external',
  },
  {
    title: 'Zorg en ondersteuning',
    id: 'ZORG',
    to: '/zorg-en-ondersteuning',
  },
  { title: 'Inkomen en Stadspas', id: 'INKOMEN', to: '/werk-en-inkomen' },
  { title: 'Afval', id: 'AFVAL', to: '/afval' },
];

describe('Chapter panel display', () => {
  it('Renders chapter items', () => {
    expect(
      shallow(
        <BrowserRouter>
          <MyChaptersPanel
            title={PANEL_TITLE}
            items={items}
            isLoading={false}
            trackCategory="track-test"
          />
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
  });

  it('Displays content loading placeholder', () => {
    const comp = mount(
      <BrowserRouter>
        <MyChaptersPanel
          title={PANEL_TITLE}
          items={items}
          isLoading={true}
          trackCategory="track-test"
        />
      </BrowserRouter>
    );
    expect(comp.find('.LoadingContent')).toHaveLength(1);
  });
});
