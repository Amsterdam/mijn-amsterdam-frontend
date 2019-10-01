import React from 'react';
import { shallow, render, mount } from 'enzyme';
import Tutorial from './Tutorial';

describe('tutorial', () => {
  const toggle = jest.fn();

  beforeAll(() => {
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });

    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  it('Renders without crashing', () => {
    const comp = mount(<Tutorial toggleTutorial={toggle} />);
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(comp.html()).toMatchSnapshot();

    comp.unmount();

    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
