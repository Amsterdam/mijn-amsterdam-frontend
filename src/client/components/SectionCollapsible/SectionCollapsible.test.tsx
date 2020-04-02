import * as analytics from '../../hooks/analytics.hook';

import { ReactWrapper, mount } from 'enzyme';

import React from 'react';
import SectionCollapsible from './SectionCollapsible';
import styles from './SectionCollapsible.module.scss';

describe('SectionCollapsible', () => {
  let component: ReactWrapper<typeof SectionCollapsible>;
  const trackingSpy = jest.spyOn(analytics, 'trackEvent');

  afterEach(() => {
    component.unmount();
    sessionStorage.clear();
  });

  it('should start uncollapsed', () => {
    component = mount(
      <SectionCollapsible
        id="test-SectionCollapsible"
        isLoading={false}
        hasItems={true}
        startCollapsed={false}
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(false);
  });

  it('should start collapsed', () => {
    component = mount(
      <SectionCollapsible
        id="test-SectionCollapsible"
        isLoading={false}
        hasItems={true}
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
  });

  it('should collapse/expand when clicking the title', () => {
    component = mount(
      <SectionCollapsible
        id="test-SectionCollapsible"
        isLoading={false}
        hasItems={true}
        title="Click me!"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
    component.find(`.Title button`).simulate('click');
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(false);
  });

  it('should call trackEvent if tracking info is provided and section is expanded', () => {
    component = mount(
      <SectionCollapsible
        id="test-SectionCollapsible"
        isLoading={false}
        hasItems={true}
        track={{ category: 'the category', name: 'the content thing' }}
        title="Click me!"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    component.find(`.Title button`).simulate('click');
    expect(trackingSpy).toHaveBeenCalledWith({
      category: 'the category',
      name: 'the content thing',
      action: 'Open klikken',
    });
  });

  it('should show title and "no items message"', () => {
    component = mount(
      <SectionCollapsible
        id="test-SectionCollapsible"
        title="My Items"
        isLoading={false}
        hasItems={false}
        noItemsMessage="No items"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.html()).toMatchSnapshot();
  });
});
