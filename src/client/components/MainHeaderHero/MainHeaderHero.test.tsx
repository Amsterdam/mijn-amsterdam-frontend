import { render } from '@testing-library/react';

import { AppRoutes } from '../../../universal/config';
import MockApp from '../../pages/MockApp';
import MainHeaderHero from './MainHeaderHero';

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
      '/header/1366x342-werk.webp'
    );
  });
});
