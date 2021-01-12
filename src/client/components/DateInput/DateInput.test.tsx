import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInput from './DateInput';
import React from 'react';
import { parseISO } from 'date-fns';

describe('<DateInput />', () => {
  it('Renders without crashing', () => {
    const onChange = () => void 0;
    render(<DateInput value={new Date('2019-11-11')} onChange={onChange} />);
    expect(screen.getByDisplayValue('2019-11-11')).toBeInTheDocument();
  });

  it('Calls back with a Date from the native datepicker', () => {
    const onChange = jest.fn(() => {});
    render(<DateInput value={new Date('2019-11-11')} onChange={onChange} />);

    userEvent.type(screen.getByDisplayValue('2019-11-11'), '2019-11-12');

    expect(onChange).toHaveBeenCalledWith(parseISO('2019-11-12'));
  });

  it('Does not allow a wrong date', () => {
    const onChange = jest.fn(() => {});
    render(<DateInput value={parseISO('20000-01-01')} onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Does not allow changing to a wrong date', () => {
    const onChange = jest.fn(() => {});
    render(<DateInput value={new Date('2019-11-11')} onChange={onChange} />);
    userEvent.type(screen.getByDisplayValue('2019-11-11'), '3333333-11-12');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Calls back with a Date from the replacement picker', () => {
    const onChange = jest.fn(() => {});
    render(
      <DateInput
        value={new Date(2019, 9, 12)}
        hasNativeSupport={false}
        onChange={onChange}
      />
    );

    const d = screen.getByDisplayValue('12');
    const d2 = screen.getByDisplayValue('oktober');
    const d3 = screen.getByDisplayValue('2019');

    expect(d).toBeInTheDocument();
    expect(d2).toBeInTheDocument();
    expect(d3).toBeInTheDocument();

    userEvent.selectOptions(screen.getByDisplayValue('2019'), ['2020']);

    expect(onChange).toHaveBeenCalledWith(new Date(2020, 9, 12));
  });
});
