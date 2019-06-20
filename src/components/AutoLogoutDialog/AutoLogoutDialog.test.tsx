import { render, mount } from 'enzyme';
import React from 'react';

import AutoLogoutDialog, { AutoLogoutDialogSettings } from './AutoLogoutDialog';

const ONE_SCOND_IN_MS = 1000;
const DOC_TITLE = 'AutoLogoutDialog';

describe('AutoLogoutDialog', () => {
  window.scrollTo = jest.fn();

  const refetch = jest.fn(() => {});

  const session: any = {
    refetch,
  };

  const settings: AutoLogoutDialogSettings = {
    secondsBeforeDialogShow: 10,
    secondsBeforeAutoLogout: 8,
  };

  let component: any;

  beforeEach(() => {
    document.title = DOC_TITLE;
    jest.useFakeTimers();
    component = mount(
      <AutoLogoutDialog session={session} settings={settings} />
    );
  });

  afterEach(() => {
    component.unmount();
    jest.clearAllTimers();
    refetch.mockReset();
  });

  it('shows the auto logout dialog after x seconds and fires callback after another x seconds', () => {
    jest.advanceTimersByTime(
      ONE_SCOND_IN_MS * settings.secondsBeforeDialogShow!
    );
    component.update();
    expect(component.childAt(0).prop('isOpen')).toBe(true);
    jest.advanceTimersByTime(
      ONE_SCOND_IN_MS * settings.secondsBeforeAutoLogout!
    );
    component.update();
    expect(refetch).toHaveBeenCalled();
  });

  it('fires callback when clicking continue button', () => {
    jest.advanceTimersByTime(
      ONE_SCOND_IN_MS * settings.secondsBeforeDialogShow!
    );
    component.update();
    let continueButton = component.find('[className*="continue-button"]');
    expect(continueButton).toHaveLength(1);

    continueButton.simulate('click');
    component.update();

    continueButton = component.find('[className*="continue-button"]');
    expect(component.childAt(0).prop('isOpen')).toBe(false);
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(continueButton).toHaveLength(0);
  });

  it('switches the document title continueously when timer is visible', () => {
    const documentTitle = document.title;

    jest.advanceTimersByTime(
      ONE_SCOND_IN_MS * settings.secondsBeforeDialogShow!
    );
    component.update();

    expect(document.title).toBe(documentTitle);

    jest.advanceTimersByTime(ONE_SCOND_IN_MS * 2);
    component.update();

    expect(document.title).not.toBe(DOC_TITLE);
  });
});
