import { shallow } from 'enzyme';
import React from 'react';
import { AppRoutes } from '../../../universal/config/routing';
import MockApp from '../../pages/MockApp';
import MainHeaderHero from './MainHeaderHero';

describe('<MainHeaderHero />', () => {
  it('Renders the Inkomen header', () => {
    expect(
      shallow(
        <MockApp
          component={MainHeaderHero}
          routeEntry={AppRoutes.INKOMEN}
          routePath={AppRoutes.INKOMEN}
        />
      ).html()
    ).toMatchSnapshot();
  });
  it('Renders the Dashboard header', () => {
    expect(
      shallow(
        <MockApp
          component={MainHeaderHero}
          routeEntry={AppRoutes.ROOT}
          routePath={AppRoutes.ROOT}
        />
      ).html()
    ).toMatchSnapshot();
  });
  it('Renders the Afval header', () => {
    expect(
      shallow(
        <MockApp
          component={MainHeaderHero}
          routeEntry={AppRoutes.AFVAL}
          routePath={AppRoutes.AFVAL}
        />
      ).html()
    ).toMatchSnapshot();
  });
});
