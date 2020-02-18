import React from 'react';
import { shallow } from 'enzyme';
import DateInput from './DateInput';

describe('<DateInput />', () => {
  it('Renders without crashing', () => {
    const minDate = '2019-01-01';
    const maxDate = '2020-01-01';
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
  it('Throws when supplying wrong date input', () => {
    const minDate = '201-01-01';
    const maxDate = '202-01-01';
    const onChange = () => void 0;
    expect(() =>
      shallow(
        <DateInput
          value="2019-11-11"
          minDate={minDate}
          maxDate={maxDate}
          onChange={onChange}
        />
      )
    ).toThrowError();
  });
});
