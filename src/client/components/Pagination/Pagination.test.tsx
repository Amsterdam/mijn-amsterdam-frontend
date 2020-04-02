import React from 'react';
import { shallow } from 'enzyme';
import Pagination from './Pagination';

it('Renders without crashing', () => {
  shallow(<Pagination />);
});
