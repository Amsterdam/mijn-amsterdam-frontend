import React from 'react';
import { shallow } from 'enzyme';
import MyNotifications from './MyNotifications';
import { MyNotification } from 'hooks/api/my-notifications-api.hook';
import { BrowserRouter } from 'react-router-dom';

const MY_NOTIFICATIONS: MyNotification[] = [];
const MY_NOTIFICATIONS_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MyNotifications
        items={MY_NOTIFICATIONS}
        total={MY_NOTIFICATIONS_TOTAL}
      />
    </BrowserRouter>
  );
});
