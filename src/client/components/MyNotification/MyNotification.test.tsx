import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';
import { describe, expect, vi } from 'vitest';

import { MyNotification } from './MyNotification';
import { type ThemaID } from '../../../universal/config/thema-config.ts';
import type {
  AppState,
  MyNotification as MyNotificationType,
} from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';

function initializeState(testState: AppState) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

describe('<MyNotification />', () => {
  const callback = vi.fn();

  const NOTIFICATIONS: MyNotificationType[] = [
    {
      id: 'test-notification',
      themaID: 'TEST_THEMA' as ThemaID,
      datePublished: '2020-10-10',
      title: 'Test notification',
      description: 'A text related to this notification',
      link: {
        to: '/test',
        title: 'More info about Test notification',
      },
      hideDatePublished: false,
      isAlert: false,
      themaTitle: '',
    },
    {
      id: 'test-notification2',
      themaID: 'TEST_THEMA' as ThemaID,
      datePublished: '2021-01-01',
      title: 'Second Test notification',
      description: 'A second text related to this notification',
      hideDatePublished: true,
      isAlert: true,
      customLink: {
        callback,
        title: 'Custom test link',
      },
      themaTitle: '',
    },
  ];

  function Component() {
    return (
      <MockApp
        routeEntry="/"
        routePath="/"
        component={() => (
          <>
            <MyNotification notification={NOTIFICATIONS[0]} />
            <MyNotification notification={NOTIFICATIONS[1]} />
          </>
        )}
        initializeState={initializeState({} as unknown as AppState)}
      />
    );
  }

  test('Tests custom link with callback', async () => {
    const user = userEvent.setup();

    render(<Component />);

    expect(screen.getByText(/Custom test link/)).toBeInTheDocument();
    await user.click(screen.getByText(/Custom test link/));
    expect(callback).toHaveBeenCalled();

    expect(
      screen.getByText(/A text related to this notification/)
    ).toBeInTheDocument();
  });

  function ComponentSmall() {
    return (
      <MockApp
        routeEntry="/"
        routePath="/"
        component={() => (
          <>
            <MyNotification notification={NOTIFICATIONS[0]} />
            <MyNotification notification={NOTIFICATIONS[1]} />
          </>
        )}
        initializeState={initializeState({} as unknown as AppState)}
      />
    );
  }

  test('MyNotification', async () => {
    const user = userEvent.setup();

    render(<ComponentSmall />);

    const ariaLabel =
      /Meer informatie over de melding: Second Test notification/;
    const description = /A second text related to this notification/;

    expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
    expect(screen.queryByText(description)).toBeInTheDocument();

    expect(screen.queryByText(/Custom test link/)).toBeInTheDocument();

    await user.click(screen.getByText(/Custom test link/));

    expect(callback).toHaveBeenCalled();

    expect(
      screen.getByText(/A second text related to this notification/)
    ).toBeInTheDocument();
  });
});
