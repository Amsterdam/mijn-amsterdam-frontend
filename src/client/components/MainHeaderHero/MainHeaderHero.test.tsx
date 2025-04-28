import { render } from '@testing-library/react';

import { MainHeaderHero } from './MainHeaderHero';
import { routes } from '../../pages/Thema/Inkomen/Inkomen-thema-config';
import MockApp from '../../pages/MockApp';

describe('<MainHeaderHero />', () => {
  it('Renders the Inkomen header', () => {
    const { container } = render(
      <MockApp
        component={MainHeaderHero}
        routeEntry={routes.themaPage}
        routePath={routes.themaPage}
      />
    );
    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/header/1600x400-algemeen.jpg'
    );
  });
});
