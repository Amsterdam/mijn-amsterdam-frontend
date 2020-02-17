import React from 'react';
import { shallow } from 'enzyme';
import DateInput from './DateInput';

it('Renders without crashing', () => {
  const minDate = new Date('2019-01-01');
  const maxDate = new Date('2020-01-01');
  const onChange = () => void 0;
  shallow(
    <DateInput
      value="2019-11-11"
      minDate={minDate}
      maxDate={maxDate}
      onChange={onChange}
    />
  );
});
