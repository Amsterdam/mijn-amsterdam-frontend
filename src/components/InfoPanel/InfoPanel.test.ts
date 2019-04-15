import React from 'react';
import { shallow } from 'enzyme';
import InfoPanel from './InfoPanel';

it('Renders without crashing', () => {
  shallow(<InfoPanel />);
});
