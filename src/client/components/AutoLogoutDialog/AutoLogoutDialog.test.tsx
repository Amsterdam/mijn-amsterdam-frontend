import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecoilRoot } from 'recoil';
import { sessionAtom } from '../../hooks/api/useSessionApi';
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

  const map: any = {};
  let listenerSpy: jest.SpyInstance;

  beforeEach(() => {
    window.addEventListener = jest.fn((event, callback: any) => {
      map[event] = (...args: any) => {
        callback && callback(...args);
      };
    });
    listenerSpy = jest.spyOn(window, 'addEventListener');
    document.title = DOC_TITLE;
    jest.useFakeTimers();
    // component = ;
  });

  afterEach(() => {
    listenerSpy.mockRestore();
    refetch.mockReset();
    // component.unmount();
    // component = null;
  });

  it('resets the autologout counter every x seconds whenever user activity is detected', async () => {
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );

    await waitFor(() =>
      expect(listenerSpy.mock.calls.some((c) => c[0] === 'mousemove')).toBe(
        true
      )
    );

    act(() => {
      map.mousemove();
      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
      );
    });

    await waitFor(() => expect(refetch).toHaveBeenCalled());

    act(() => {
      map.mousemove();

      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
      );
    });

    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it('shows the auto logout dialog after x seconds and fires callback after another x seconds', () => {
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );

    act(() => {
      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS * settings.secondsBeforeDialogShow!
      );
    });

    expect(screen.getByText('Wilt u doorgaan?')).toBeInTheDocument();

    act(() => {
      map.mousemove();

      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS * settings.secondsSessionRenewRequestInterval!
      );
    });

    expect(refetch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS * settings.secondsBeforeAutoLogout!
      );
    });

    expect(logout).toHaveBeenCalled();
  });

  it('fires callback when clicking continue button', () => {
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );

    act(() => {
      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS *
          (settings.secondsBeforeDialogShow! -
            settings.secondsBeforeAutoLogout!)
      );
    });

    expect(screen.getByText('Doorgaan')).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getByText('Doorgaan'));
    });

    expect(refetch).toHaveBeenCalledTimes(1);

    expect(screen.queryByText('Doorgaan')).toBeNull();
  });

  it('switches the document title continuously when timer is visible', () => {
    render(
      <RecoilRoot
        initializeState={(snapshot) => snapshot.set(sessionAtom, session)}
      >
        <AutoLogoutDialog settings={settings} />
      </RecoilRoot>
    );

    const documentTitle = document.title;

    act(() => {
      jest.advanceTimersByTime(
        ONE_SECOND_IN_MS *
          (settings.secondsBeforeDialogShow! -
            settings.secondsBeforeAutoLogout!)
      );
    });

    expect(screen.getByText('Doorgaan')).toBeInTheDocument();

    expect(document.title).toBe(documentTitle);

    act(() => {
      jest.advanceTimersByTime(ONE_SECOND_IN_MS * 2);

      expect(document.title).not.toBe(DOC_TITLE);
    });
  });
});
