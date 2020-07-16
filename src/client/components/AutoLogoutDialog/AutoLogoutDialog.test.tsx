import { mount } from 'enzyme';
import React from 'react';
import { SessionContext } from '../../SessionState';
import AutoLogoutDialog, { AutoLogoutDialogSettings } from './AutoLogoutDialog';

const ONE_SECOND_IN_MS = 1000;
const DOC_TITLE = 'AutoLogoutDialog';

describe('AutoLogoutDialog', () => {
  window.scrollTo = jest.fn();

  const refetch = jest.fn(() => {});
  const logout = jest.fn(() => {});

  const session: any = {
    refetch,
    logout,
  };

  const settings: AutoLogoutDialogSettings = {
    secondsBeforeDialogShow: 18,
    secondsBeforeAutoLogout: 8,
    secondsSessionRenewRequestInterval: 2,
  };

  let component: any;
  const map: any = {};

  beforeAll(() => {
    window.addEventListener = jest.fn((event, callback: any) => {
      map[event] = () => {
        callback && callback();
      };
    });
    // inspired by https://github.com/facebook/jest/issues/890#issuecomment-450708771
    delete window.location;
    (window as any) = Object.create(window);
    window.location = {
      ...window.location,
      href: '/test',
    };
  });

  afterAll(() => {
    (window.addEventListener as any).mockRestore();
  });

  beforeEach(() => {
    document.title = DOC_TITLE;
    jest.useFakeTimers();
    component = mount(
      <SessionContext.Provider value={session}>
        <AutoLogoutDialog settings={settings} />
      </SessionContext.Provider>
    );
  });

  afterEach(() => {
    refetch.mockReset();
    component.unmount();
    component = null;
  });

  it('resets the autologout counter every x seconds whenever user activity is detected', () => {
    const rf = refetch;

    map.mousemove();

    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
    );
    expect(refetch).toHaveBeenCalled();
    expect(refetch).toBe(rf);

    map.mousemove();
    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
    );

    expect(refetch).toBe(rf);

    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it('shows the auto logout dialog after x seconds and fires callback after another x seconds', () => {
    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsBeforeDialogShow!
    );
    component.update();
    expect(component.childAt(0).prop('isOpen')).toBe(true);
    map.mousemove();
    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
    );
    expect(refetch).not.toHaveBeenCalled();
    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsBeforeAutoLogout!
    );
    component.update();
    expect(logout).toHaveBeenCalled();
  });

  it('fires callback when clicking continue button', () => {
    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS *
        (settings.secondsBeforeDialogShow! - settings.secondsBeforeAutoLogout!)
    );
    component.update();
    let continueButton = component.find('Button.continue-button');
    expect(continueButton).toHaveLength(1);

    continueButton.simulate('click');
    component.update();

    continueButton = component.find('Button.continue-button');
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(continueButton).toHaveLength(0);
  });

  it('switches the document title continuously when timer is visible', () => {
    const documentTitle = document.title;

    jest.advanceTimersByTime(
      ONE_SECOND_IN_MS * settings.secondsBeforeDialogShow! -
        settings.secondsBeforeAutoLogout!
    );
    component.update();
    let continueButton = component.find('Button.continue-button');
    expect(continueButton).toHaveLength(1);

    expect(document.title).toBe(documentTitle);

    jest.advanceTimersByTime(ONE_SECOND_IN_MS * 2);
    component.update();

    expect(document.title).not.toBe(DOC_TITLE);
  });
});
