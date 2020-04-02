import { DEFAULT_CENTROID } from '../../config/Map.constants';
import { MyAreaMap } from './MyArea';
import React from 'react';
import { shallow } from 'enzyme';

it('Renders without crashing', () => {
  shallow(<MyAreaMap center={DEFAULT_CENTROID} title="My Map! test." />);
});
