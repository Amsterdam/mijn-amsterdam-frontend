import React from 'react';
import { shallow } from 'enzyme';
import Page from './Page';

it('Renders without crashing', () => {
  shallow(<Page>Hela!</Page>);
});
