import React from 'react';
import { mount } from 'enzyme';
import MainNavSubmenu from './MainNavSubmenu';
import { BrowserRouter } from 'react-router-dom';

const SUBMENU_TITLE = 'submenutje';

describe('<MainNavSubmenu/> rendering', () => {
  let comp: any;
  beforeEach(() => {
    jest.useFakeTimers();
  });
  beforeAll(() => {
    comp = mount(
      <BrowserRouter>
        <MainNavSubmenu title={SUBMENU_TITLE} id="een-submenu">
          <a href="#">Linkje</a>
        </MainNavSubmenu>
      </BrowserRouter>
    );
  });
  it('Renders a submenu item', () => {
    expect(comp.html()).toMatchSnapshot();
  });

  it('Opens/closes the submenu panel on user interaction', () => {
    expect(comp.find('.MainNavSubmenu')).toHaveLength(1);
    comp.find('.MainNavSubmenu').simulate('mouseenter');
    jest.runAllTimers();
    comp.update();
    expect(comp.find('.SubmenuPanel.SubmenuPanelOpen')).toHaveLength(1);
    expect(comp.html()).toMatchSnapshot();
    comp.find('.MainNavSubmenu').simulate('mouseleave');
    jest.runAllTimers();
    comp.update();
    expect(comp.find('.SubmenuPanel.SubmenuPanelOpen')).toHaveLength(0);
    comp.find('.MainNavSubmenu').simulate('focus');
    jest.runAllTimers();
    comp.update();
    expect(comp.find('.SubmenuPanel.SubmenuPanelOpen')).toHaveLength(1);
    comp.find('.MainNavSubmenu').simulate('blur');
    jest.runAllTimers();
    comp.update();
    expect(comp.find('.SubmenuPanel.SubmenuPanelOpen')).toHaveLength(0);
  });
});
