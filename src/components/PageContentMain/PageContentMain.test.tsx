import React from 'react';
import { shallow } from 'enzyme';
import PageContentMain from './PageContentMain';

it('Renders without crashing', () => {
  shallow(<PageContentMain>Hela!</PageContentMain>);
});
