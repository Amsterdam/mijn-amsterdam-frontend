import { describe, expect } from 'vitest';
import { sortNotifications } from './tips-and-notifications';

describe('tips-and-notifications', () => {
  describe('sortNotifications', () => {
    it('Should sort notifications by datePublished and insert tips', () => {
      // three more with different dates
      const notifications = [
        {
          title: 'notification 1',
          chapter: 'chapter',
          description: 'description',
          id: 'id',
          datePublished: '2021-07-07T10:47:44.6107122',
          isTip: false,
        },
        {
          title: 'notification 2',
          chapter: 'chapter',
          description: 'description',
          id: 'id',
          datePublished: '2021-08-07T10:47:44.6107122',
          isTip: false,
        },
        {
          title: 'tip',
          chapter: 'chapter',
          description: 'description',
          id: 'id',
          datePublished: '2021-09-07T10:47:44.6107122',
          isTip: true,
        },
        {
          title: 'notification 3',
          chapter: 'chapter',
          description: 'description',
          id: 'id',
          datePublished: '2021-10-07T10:47:44.6107122',
          isTip: false,
        },
        {
          title: 'notification 4',
          chapter: 'chapter',
          description: 'description',
          id: 'id',
          datePublished: '2021-11-07T10:47:44.6107122',
          isTip: false,
        },
      ];

      const sortedNotifications = sortNotifications(notifications);

      expect(sortedNotifications[0].title).toBe('notification 4');

      expect(sortedNotifications[3].title).toBe('tip');

      expect(sortedNotifications[4].title).toBe('notification 1');
    });
  });
});
