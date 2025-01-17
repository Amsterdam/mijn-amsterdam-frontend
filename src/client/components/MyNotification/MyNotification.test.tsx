import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Thema } from '../../../universal/config/thema';
import { MyNotification } from '../../../universal/types';

describe('<MyNotifications />', () => {
  const callback = vi.fn();

  const NOTIFICATIONS: MyNotification[] = [
    {
      id: 'test-notification',
      thema: 'TEST_THEMA' as Thema,
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
      thema: 'TEST_THEMA' as Thema,
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

  it('Tests custom link with callback', async () => {
    const user = userEvent.setup();

    expect(screen.getByText('Custom test link')).toBeInTheDocument();
    await user.click(screen.getByText('Custom test link'));
    expect(callback).toHaveBeenCalled();
  });
});
