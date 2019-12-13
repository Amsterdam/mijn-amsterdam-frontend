import React, { Component } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import SectionCollapsible from './SectionCollapsible';
import styles from './SectionCollapsible.module.scss';

import * as analytics from 'hooks/analytics.hook';

describe('SectionCollapsible', () => {
  let component: ReactWrapper<typeof SectionCollapsible>;
  let toggleCollapsed: () => void;

  const trackingSpy = jest.spyOn(analytics, 'trackEvent');

  beforeEach(() => {
    toggleCollapsed = jest.fn();
  });

  afterEach(() => {
    component.unmount();
    sessionStorage.clear();
  });

  it('should start uncollapsed', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        isCollapsed={false}
        onToggleCollapsed={toggleCollapsed}
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(false);
  });

  it('should start collapsed', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        isCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
  });

  it('should collapse/expand when clicking the title', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        title="Click me!"
        isCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
    component.find(`.${styles.Title} button`).simulate('click');
    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
  });

  it('should call trackEvent if tracking info is provided and section is expanded', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        isCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
        track={{ category: 'the category', name: 'the content thing' }}
        title="Click me!"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    component.find(`.${styles.Title} button`).simulate('click');
    expect(trackingSpy).toHaveBeenCalledWith({
      category: 'the category',
      name: 'the content thing',
      action: 'Open klikken',
    });
  });

  it('should show title and "no items message"', () => {
    component = mount(
      <SectionCollapsible
        title="My Items"
        isLoading={false}
        hasItems={false}
        isCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
        noItemsMessage="No items"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(component.html()).toMatchSnapshot();
  });
});
