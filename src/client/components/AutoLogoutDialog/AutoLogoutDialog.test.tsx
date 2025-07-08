import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';

import { AutoLogoutDialog } from './AutoLogoutDialog.tsx';
import { useSessionValue } from '../../hooks/api/useSessionApi.ts';
import { useCounter } from '../../hooks/timer.hook.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';

vi.mock('../../hooks/api/useSessionApi', async (importOriginal) => ({
  ...(await importOriginal()),
  useSessionValue: vi.fn(),
}));

vi.mock('../../hooks/useProfileType', () => ({
  useProfileTypeValue: vi.fn(),
}));

vi.mock('../../hooks/timer.hook');

async function advanceTimersAndAct(ms: number) {
  await act(() => {
    vi.advanceTimersByTimeAsync(ms);
    vi.runAllTimers();
  });
}

describe('AutoLogoutDialog', () => {
  // useCounter;
  const mockSession = {
    logout: vi.fn(),
    refetch: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    (useSessionValue as Mock).mockReturnValue(mockSession);
    (useProfileTypeValue as Mock).mockReturnValue('private');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should not render the dialog initially', async () => {
    (useCounter as Mock).mockReturnValue({
      count: 0,
    });

    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 15 * 60000} // 15 minutes into the future
        lastChanceBeforeAutoLogoutSeconds={120}
      />
    );

    expect(
      screen.queryByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
    ).not.toBeInTheDocument();
  });

  it('should open the dialog after the specified time', async () => {
    (useCounter as Mock).mockReturnValue({
      count: 0,
    });

    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 5000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await advanceTimersAndAct(2000);

    await waitFor(() =>
      expect(
        screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
      ).toBeInTheDocument()
    );
  });

  it('should call session.logout when the timer expires', async () => {
    (useCounter as Mock).mockImplementationOnce((opts) => {
      if (opts.onMaxCount) {
        setTimeout(opts.onMaxCount, opts.maxCount * 1000);
      }
      return {
        count: 0,
      };
    });

    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await advanceTimersAndAct(2002);

    await waitFor(() => expect(mockSession.logout).toHaveBeenCalled());
  });

  it('should display the continue button and call session.refetch when clicked', async () => {
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
        asynRefreshEnabled
      />
    );

    await advanceTimersAndAct(1);

    await waitFor(() =>
      expect(
        screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
      ).toBeInTheDocument()
    );

    const continueButton = screen.getByText('Doorgaan');
    fireEvent.click(continueButton);

    expect(mockSession.refetch).toHaveBeenCalled();
  });

  it('should display the logout button and redirect to the logout URL', async () => {
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await advanceTimersAndAct(1);

    await waitFor(() =>
      expect(
        screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
      ).toBeInTheDocument()
    );

    const logoutButton = screen.getByText('Nu uitloggen');
    expect(logoutButton).toHaveAttribute(
      'href',
      'http://bff-api-host/auth/logout'
    );
  });

  it('should toggle the document title on each tick', async () => {
    const originalTitle = document.title;
    const callOnTick = vi.fn();

    (useCounter as Mock).mockImplementationOnce((opts) => {
      if (opts.onTick) {
        callOnTick.mockImplementation((count) => opts.onTick(count));
      }
      return {
        count: 0,
      };
    });

    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={10}
      />
    );

    vi.advanceTimersByTimeAsync(1000);

    await waitFor(() =>
      expect(
        screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
      ).toBeInTheDocument()
    );

    await act(() => {
      callOnTick(1);
    });

    expect(document.title).toBe(originalTitle);

    await act(() => {
      callOnTick(2);
    });

    expect(document.title).toBe('Wilt u ingelogd blijven op Mijn Amsterdam?');
  });

  it('should restore the original document title when unmounted', async () => {
    const originalTitle = document.title;

    const { unmount } = render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    vi.advanceTimersByTimeAsync(1001);

    await waitFor(() =>
      expect(
        screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
      ).toBeInTheDocument()
    );

    unmount();
    expect(document.title).toBe(originalTitle);
  });
});
