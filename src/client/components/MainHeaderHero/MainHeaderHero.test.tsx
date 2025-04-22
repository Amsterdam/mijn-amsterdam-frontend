import { render } from '@testing-library/react';

import { MainHeaderHero } from './MainHeaderHero';
import MockApp from '../../pages/MockApp';
import { routeConfig } from '../../pages/Thema/Inkomen/Inkomen-thema-config';

describe('<MainHeaderHero />', () => {
  it('Renders the Inkomen header', () => {
    const { container } = render(
      <MockApp
        component={MainHeaderHero}
        routeEntry={routeConfig.themaPage.path}
        routePath={routeConfig.themaPage.path}
      />
    );
    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/header/1600x400-algemeen.jpg'
    );
  });
});
