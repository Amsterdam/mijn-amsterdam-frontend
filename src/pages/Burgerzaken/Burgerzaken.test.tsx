import React from 'react';
import { shallow } from 'enzyme';
import Burgerzaken from './Burgerzaken';

it('Renders without crashing', () => {
  shallow(<Burgerzaken />);
});
