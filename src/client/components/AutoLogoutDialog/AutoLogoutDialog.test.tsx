import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';

import { AutoLogoutDialog } from './AutoLogoutDialog';
import { useProfileTypeValue } from '../../hooks/useProfileType';

const mocks = vi.hoisted(() => {
  return {
    mockSession: {
      logout: vi.fn(),
      refetch: vi.fn(),
      isLoading: false,
    },
  };
});

vi.mock('../../hooks/api/useSessionApi', async (importOriginal) => ({
  ...(await importOriginal()),
  useSessionValue() {
    return mocks.mockSession;
  },
}));

vi.mock('../../hooks/useProfileType', () => ({
  useProfileTypeValue: vi.fn(),
}));

async function advanceTimersAndAct(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
    await vi.runAllTimersAsync();
  });
}

describe('AutoLogoutDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    (useProfileTypeValue as Mock).mockReturnValue('private');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should not render the dialog initially', async () => {
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
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 5000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await advanceTimersAndAct(2000);

    expect(
      screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
    ).toBeInTheDocument();
  });

  it('should call session.logout when the timer expires', async () => {
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    // Runs the timer for 2 seconds to trigger the dialog
    await act(() => vi.advanceTimersByTimeAsync(2002));
    // Wait for the nested timer to complete
    await act(() => vi.runOnlyPendingTimersAsync());

    expect(mocks.mockSession.logout).toHaveBeenCalled();
  });

  it('should display the continue button and call session.refetch when clicked', async () => {
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
        asynRefreshEnabled={true}
      />
    );

    await advanceTimersAndAct(1);

    expect(
      screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
    ).toBeInTheDocument();

    const continueButton = screen.getByText('Doorgaan');
    fireEvent.click(continueButton);

    expect(mocks.mockSession.refetch).toHaveBeenCalled();
  });

  it('should display the logout button and redirect to the logout URL', async () => {
    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await advanceTimersAndAct(1);

    expect(
      screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
    ).toBeInTheDocument();

    const logoutButton = screen.getByText('Nu uitloggen');
    expect(logoutButton).toHaveAttribute(
      'href',
      'http://bff-api-host/auth/logout'
    );
  });

  it('should toggle the document title on each tick', async () => {
    document.title = 'yoow';
    const originalTitle = document.title;

    render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 8000}
        lastChanceBeforeAutoLogoutSeconds={6}
      />
    );

    // Opens dialog
    await act(() => vi.advanceTimersByTimeAsync(2000));

    expect(
      screen.getByText('Wilt u ingelogd blijven op Mijn Amsterdam?')
    ).toBeInTheDocument();

    // Next tick should change the title
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(document.title).toBe(originalTitle);

    // Next tick should change the title again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(document.title).toBe('Wilt u ingelogd blijven op Mijn Amsterdam?');
  });

  it('should restore the original document title when unmounted', async () => {
    const originalTitle = document.title;

    vi.unmock('../../hooks/timer.hook');

    const { unmount } = render(
      <AutoLogoutDialog
        expiresAtMilliseconds={Date.now() + 2000}
        lastChanceBeforeAutoLogoutSeconds={1}
      />
    );

    await act(() => vi.advanceTimersByTimeAsync(1001));

    expect(
      screen.getByRole('heading', {
        name: 'Wilt u ingelogd blijven op Mijn Amsterdam?',
      })
    ).toBeInTheDocument();

    unmount();
    expect(document.title).toBe(originalTitle);
  });
});
