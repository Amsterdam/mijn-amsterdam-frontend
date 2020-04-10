import { BrowserRouter } from 'react-router-dom';
import { MyNotification } from '../../../server/services/services-notifications';
import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';

const NOTIFICATIONS: MyNotification[] = [];
const UPDATES_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MyNotifications
        trackCategory="myNotifications"
        items={NOTIFICATIONS}
        total={UPDATES_TOTAL}
      />
    </BrowserRouter>
  );
});
