import { BrowserRouter } from 'react-router-dom';
import MyNotifications from './MyNotifications';
import { render, screen } from '@testing-library/react';
import { MyNotification } from '../../../universal/types';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { defaultDateFormat } from '../../../universal/helpers';
import { vi, describe, expect, it } from 'vitest';

describe('<MyNotifications />', () => {
  const callback = vi.fn();

  const NOTIFICATIONS: MyNotification[] = [
    {
      id: 'test-notification',
      chapter: 'TEST_CHAPTER',
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
      chapter: 'TEST_CHAPTER',
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

  it('Tests custom link with callback', () => {
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
    userEvent.click(screen.getByText('Custom test link'));
    expect(callback).toHaveBeenCalled();
  });
});
