import React, { Component } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import SectionCollapsible from './SectionCollapsible';
import styles from './SectionCollapsible.module.scss';

import * as analytics from 'hooks/analytics.hook';

describe('SectionCollapsible', () => {
  let component: ReactWrapper<typeof SectionCollapsible>;
  let toggleCollapsed: (isCollapsed: boolean) => void;

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
        startCollapsed={false}
        onToggleCollapsed={toggleCollapsed}
        id="testje"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );
    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(false);
  });

  it('should start collapsed', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        startCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
        id="testje"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
  });

  it('should collapse/expand when clicking the title', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        title="Click me!"
        startCollapsed={true}
        onToggleCollapsed={toggleCollapsed}
        id="testje"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    expect(toggleCollapsed).toHaveBeenCalledTimes(1);
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
    component.find(`.${styles.Title} span[role="button"]`).simulate('click');
    expect(toggleCollapsed).toHaveBeenCalledTimes(2);
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(false);
    component.find(`.${styles.Title} span[role="button"]`).simulate('click');
    expect(toggleCollapsed).toHaveBeenCalledTimes(3);
    expect(component.childAt(0).hasClass(styles.isCollapsed)).toEqual(true);
  });

  it('should call trackEvent if tracking info is provided and section is expanded', () => {
    component = mount(
      <SectionCollapsible
        isLoading={false}
        hasItems={true}
        startCollapsed={true}
        track={{ category: 'the category', name: 'the content thing' }}
        title="Click me!"
        id="testje"
      >
        <div style={{ height: 500 }}>Boohoo!</div>
      </SectionCollapsible>
    );

    component.find(`.${styles.Title} span[role="button"]`).simulate('click');
    expect(trackingSpy).toHaveBeenCalledWith({
      category: 'the category',
      name: 'the content thing',
      action: 'Open klikken',
    });
    component.find(`.${styles.Title} span[role="button"]`).simulate('click');
    expect(trackingSpy).toBeCalledTimes(1);
    component.find(`.${styles.Title} span[role="button"]`).simulate('click');
    expect(trackingSpy).toBeCalledTimes(2);
  });
});
