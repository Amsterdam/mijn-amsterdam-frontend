import React from 'react';
import { shallow, mount } from 'enzyme';
import MyChaptersPanel from './MyChaptersPanel';
import { BrowserRouter } from 'react-router-dom';
import { ChapterMenuItem } from '../../config/menuItems';
import * as profileTypeHook from '../../hooks/useProfileType';

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
  {
    title: 'Zorg en ondersteuning',
    id: 'ZORG',
    to: '/zorg-en-ondersteuning',
    profileTypes: ['private'],
  },
  {
    title: 'Inkomen en Stadspas',
    id: 'INKOMEN',
    to: '/inkomen-en-stadspas',
    profileTypes: ['private'],
  },
  { title: 'Afval', id: 'AFVAL', to: '/afval', profileTypes: ['private'] },
];

describe('Chapter panel display', () => {
  const profileTypeHookMock = ((profileTypeHook as any).useProfileTypeValue = jest.fn(
    () => 'prive'
  ));

  afterAll(() => {
    profileTypeHookMock.mockRestore();
  });

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
