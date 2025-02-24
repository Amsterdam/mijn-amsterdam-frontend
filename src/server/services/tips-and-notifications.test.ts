import { describe, expect } from 'vitest';

import { sortNotificationsAndInsertTips } from './tips-and-notifications';
import { MyNotification } from '../../universal/types';

describe('tips-and-notifications', () => {
  test('Should sort notifications by datePublished and insert tips', () => {
    const notifications = [
      {
        title: 'tip 0',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-09-07',
        isTip: true,
      },
      {
        title: 'notification 4',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-08-07',
        isTip: false,
      },
      {
        title: 'notification 1',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-07-07',
        isTip: false,
      },
      {
        title: 'notification 2',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-06-07',
        isTip: false,
      },
      {
        title: 'tip 1',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-05-07',
        isTip: true,
      },
      {
        title: 'notification 3',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-04-07',
        isTip: false,
      },
      {
        title: 'tip 2',
        thema: 'thema',
        description: 'description',
        id: 'id',
        datePublished: '2021-03-07',
        isTip: true,
      },
    ] as unknown as MyNotification[];

    const sortedNotifications = sortNotificationsAndInsertTips(
      notifications,
      false
    );

    expect(sortedNotifications[0].title).toBe('notification 4');
    expect(sortedNotifications[1].title).toBe('notification 1');
    expect(sortedNotifications[2].title).toBe('notification 2');
    expect(sortedNotifications[3].title).toBe('tip 0');
    expect(sortedNotifications[4].title).toBe('notification 3');
    expect(sortedNotifications[5].title).toBe('tip 1');
    expect(sortedNotifications[6].title).toBe('tip 2');
  });
});
