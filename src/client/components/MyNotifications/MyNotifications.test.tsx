import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import MyNotifications from './MyNotifications';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { MyNotification } from '../../../universal/types';

describe('<MyNotifications />', () => {
  const callback = vi.fn();

  const NOTIFICATIONS: MyNotification[] = [
    {
      id: 'test-notification',
      thema: 'TEST_THEMA',
      datePublished: '2020-10-10',
      title: 'Test notification',
      description: 'A text related to this notification',
      link: {
        to: '/test',
        title: 'More info about Test notification',
      },
      hideDatePublished: false,
      isAlert: false,
    },
    {
      id: 'test-notification2',
      thema: 'TEST_THEMA',
      datePublished: '2021-01-01',
      title: 'Second Test notification',
      description: 'A second text related to this notification',
      hideDatePublished: true,
      isAlert: true,
      customLink: {
        callback,
        title: 'Custom test link',
      },
    },
  ];

  it('Shows notifications', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MyNotifications
            isLoading={false}
            trackCategory="myNotifications"
            items={NOTIFICATIONS}
          />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getByText('Test notification')).toBeInTheDocument();
    expect(screen.getByText('Second Test notification')).toBeInTheDocument();
    expect(
      screen.getByText('A text related to this notification')
    ).toBeInTheDocument();
    expect(
      screen.getByText('A second text related to this notification')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(defaultDateFormat(NOTIFICATIONS[1].datePublished))
    ).toBeNull();
    expect(screen.getByLabelText('ALERT')).toBeInTheDocument();
  });

  it('Does not show notifications when loading', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MyNotifications
            isLoading={true}
            trackCategory="myNotifications"
            items={NOTIFICATIONS}
          />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.queryByText('Test notification')).toBeNull();
    expect(
      screen.queryByText('A text related to this notification')
    ).toBeNull();
  });

  it('Tests custom link with callback', async () => {
    const user = userEvent.setup();

    const screen = render(
      <RecoilRoot>
        <BrowserRouter>
          <MyNotifications
            isLoading={false}
            trackCategory="myNotifications"
            items={NOTIFICATIONS}
          />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getByText('Custom test link')).toBeInTheDocument();
    await user.click(screen.getByText('Custom test link'));
    expect(callback).toHaveBeenCalled();
  });
});
