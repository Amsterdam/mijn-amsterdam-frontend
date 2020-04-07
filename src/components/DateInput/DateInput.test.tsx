import { mount, shallow } from 'enzyme';

import DateInput from './DateInput';
import React from 'react';

describe('<DateInput />', () => {
  it('Renders without crashing', () => {
    const onChange = () => void 0;
    shallow(<DateInput value={new Date('2019-11-11')} onChange={onChange} />);
  });

  it('Calls back with a Date from the native datepicker', () => {
    const onChange = jest.fn(() => {});
    const comp = mount(
      <DateInput value={new Date('2019-11-11')} onChange={onChange} />
    );
    const event = {
      preventDefault() {},
      target: { value: '2019-11-12' },
    };
    comp.find('input.DateInput').simulate('change', event);

    expect(onChange).toHaveBeenCalledWith(new Date('2019-11-12'));
  });

  it('Calls back with a Date from the replacement picker', () => {
    const onChange = jest.fn(() => {});
    const comp = mount(
      <DateInput
        value={new Date('2019-11-11')}
        hasNativeSupport={false}
        onChange={onChange}
      />
    );
    const event = {
      preventDefault() {},
      target: { value: '12' },
    };
    const selectInputs = comp.find('select');
    expect(selectInputs).toHaveLength(3);

    selectInputs.at(1).simulate('change', event);

    expect(onChange).toHaveBeenCalledWith(new Date(2019, 12, 11));
  });
});
