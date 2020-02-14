import React from 'react';
import { shallow } from 'enzyme';
import DateInput from './DateInput';

it('Renders without crashing', () => {
  shallow(<DateInput />);
});
