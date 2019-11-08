import React from 'react';
import { mount } from 'enzyme';
import Tutorial from './Tutorial';

describe('tutorial', () => {
  it('Renders without crashing', () => {
    const comp = mount(
      <div>
        <div data-tutorial-item="Hello world!left-top">This is happening</div>
        <div data-tutorial-item="Goody two shoes!left-bottom">
          On a large scale
        </div>
        <Tutorial />
      </div>
    );

    expect(comp.html()).toMatchSnapshot();
    comp.unmount();
  });
});
