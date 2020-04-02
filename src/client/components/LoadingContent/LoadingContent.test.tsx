import React from 'react';
import { shallow } from 'enzyme';
import LoadingContent from './LoadingContent';
import { BarConfig } from './LoadingContent';

describe('LoadingContent component', () => {
  it('Renders without crashing', () => {
    shallow(<LoadingContent />);
  });

  it('Show the correct default barConfig', () => {
    const component = shallow(<LoadingContent />);
    expect(component.html()).toMatchSnapshot();
  });

  it('Show the correct custom barConfig', () => {
    const barConfigCustom: BarConfig = [
      ['300px', '20px', '10px'],
      ['200px', '10px', '5px'],
    ];

    const component = shallow(<LoadingContent barConfig={barConfigCustom} />);
    expect(component.html()).toMatchSnapshot();
  });
});
