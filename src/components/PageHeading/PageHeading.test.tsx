import React from 'react';
import { shallow } from 'enzyme';
import PageHeading from './PageHeading';

it('Renders without crashing', () => {
  shallow(<PageHeading>Hola!</PageHeading>);
});
