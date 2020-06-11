import { shallow } from 'enzyme';
import React from 'react';
import Proclaimer from './Proclaimer';

it('Renders without crashing', () => {
  shallow(<Proclaimer />);
});
