import React from 'react';
import { shallow } from 'enzyme';
import MyNotifications from './MyNotifications';
import { MyNotification } from 'hooks/api/my-notifications-api.hook';
import { BrowserRouter } from 'react-router-dom';

const MELDINGEN: MyNotification[] = [];
const MELDINGEN_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MyNotifications
        trackCategory="myNotifications"
        items={MELDINGEN}
        total={MELDINGEN_TOTAL}
      />
    </BrowserRouter>
  );
});
