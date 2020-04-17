import { mount, shallow } from 'enzyme';

import DateInput from './DateInput';
import React from 'react';
import { parseISO } from 'date-fns';

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

    expect(onChange).toHaveBeenCalledWith(parseISO('2019-11-12'));
  });

  it('Does not allow a wrong date', () => {
    const onChange = jest.fn(() => {});
    const comp = mount(
      <DateInput value={parseISO('20000-01-01')} onChange={onChange} />
    );

    expect(comp.find('input.DateInputError')).toHaveLength(1);
  });

  it('Does not allow changing to a wrong date', () => {
    const onChange = jest.fn(() => {});
    const comp = mount(
      <DateInput value={new Date('2019-11-11')} onChange={onChange} />
    );
    const event = {
      preventDefault() {},
      target: { value: '20000-11-12' },
    };
    comp.find('input.DateInput').simulate('change', event);

    expect(onChange).not.toHaveBeenCalled();
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
