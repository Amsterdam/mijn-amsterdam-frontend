import React from 'react';
import { shallow, render, mount } from 'enzyme';
import Tutorial from './Tutorial';

describe('tutorial', () => {
  const toggle = jest.fn();

  beforeAll(() => {
    jest.spyOn(document, 'getElementById').mockReturnValue({
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
      }),
      // addEventListener: jest.fn() as any,
    } as HTMLElement);

    window.matchMedia = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });

    window.addEventListener = jest.fn();
    document.addEventListener = jest.fn();
  });

  it('Renders without crashing', () => {
    mount(<Tutorial toggleTutorial={toggle} />);
    expect(document.addEventListener).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalled();
  });
});
