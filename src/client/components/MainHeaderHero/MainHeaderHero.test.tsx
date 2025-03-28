import { render } from '@testing-library/react';

import { MainHeaderHero } from './MainHeaderHero';
import { AppRoutes } from '../../../universal/config/routes';
import MockApp from '../../pages/MockApp';

describe('<MainHeaderHero />', () => {
  it('Renders the Inkomen header', () => {
    const { container } = render(
      <MockApp
        component={MainHeaderHero}
        routeEntry={AppRoutes.INKOMEN}
        routePath={AppRoutes.INKOMEN}
      />
    );
    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/header/1600x400-werk.jpg'
    );
  });
});
