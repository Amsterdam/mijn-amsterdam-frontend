import { BrowserRouter } from 'react-router-dom';
import { MyNotification } from '../../hooks/api/my-notifications-api.hook';
import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';

const UPDATES: MyNotification[] = [];
const UPDATES_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MyNotifications
        trackCategory="myNotifications"
        items={UPDATES}
        total={UPDATES_TOTAL}
      />
    </BrowserRouter>
  );
});
