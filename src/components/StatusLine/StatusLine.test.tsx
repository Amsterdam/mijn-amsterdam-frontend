import React from 'react';
import { shallow } from 'enzyme';
import StatusLine from './StatusLine';

it('Renders without crashing', () => {
  shallow(<StatusLine />);
});
