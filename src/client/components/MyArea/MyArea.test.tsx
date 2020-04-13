import React from 'react';
import { shallow } from 'enzyme';
import MyAreaMap from './MyArea';
import { DEFAULT_CENTROID } from './MyArea.constants';

it('Renders without crashing', () => {
  shallow(<MyAreaMap center={DEFAULT_CENTROID} title="My Map! test." />);
});
