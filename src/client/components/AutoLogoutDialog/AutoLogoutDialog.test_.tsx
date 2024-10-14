/**
 * After Update to REACT 18 and Updated testing-libraries this test doesn't work anymore. State doesn't update correctly in some of the used hooks.
 */
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import AutoLogoutDialog, { AutoLogoutDialogSettings } from './AutoLogoutDialog';
import { ONE_SECOND_MS } from '../../../server/config/app';
import { sessionAtom } from '../../hooks/api/useSessionApi';

const DOC_TITLE = 'AutoLogoutDialog';

describe('AutoLogoutDialog', () => {
  const refetch = vi.fn(() => {});
  const logout = vi.fn(() => {});
  const session: any = {
    refetch,
    logout,
  };
  const settings: AutoLogoutDialogSettings = {
    secondsBeforeDialogShow: 18,
    secondsBeforeAutoLogout: 8,
    secondsSessionRenewRequestInterval: 2,
  };
  const map: any = {};
  window.addEventListener = vi.fn((event, callback: any) => {
    map[event] = (...args: any) => {
      callback && callback(...args);
    };
  });
  document.title = DOC_TITLE;
  vi.useFakeTimers();
  it('shows the auto logout dialog after x seconds and fires callback after another x seconds', () => {
    const screen = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND_MS * settings.secondsBeforeDialogShow!);
    });
    expect(screen.getByText('Wilt u doorgaan?')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND_MS * settings.secondsBeforeAutoLogout!);
    });
    expect(logout).toHaveBeenCalled();
  });
  it('fires callback when clicking continue button', async () => {
    const user = userEvent.setup();
    const screen = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND_MS * settings.secondsBeforeDialogShow!);
    });
    expect(screen.getByText('Doorgaan')).toBeInTheDocument();
    await user.click(screen.getByText('Doorgaan'));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Doorgaan')).toBeNull();
  });
  it('switches the document title continuously when timer is visible', () => {
    const screen = render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );
    const documentTitle = document.title;
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND_MS * settings.secondsBeforeDialogShow!);
    });
    expect(screen.getByText('Doorgaan')).toBeInTheDocument();
    expect(document.title).toBe(documentTitle);
    const secondsToAdvance = 2.1;
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND_MS * secondsToAdvance);
    });
    expect(document.title).not.toBe(DOC_TITLE);
  });
});
