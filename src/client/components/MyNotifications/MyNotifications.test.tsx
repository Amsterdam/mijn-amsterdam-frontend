import { BrowserRouter } from 'react-router-dom';
import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';
import { MyNotification } from '../../../universal/types';

const NOTIFICATIONS: MyNotification[] = [];
const NOTIFICATIONS_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MyNotifications
        trackCategory="myNotifications"
        items={NOTIFICATIONS}
        total={NOTIFICATIONS_TOTAL}
      />
    </BrowserRouter>
  );
});
