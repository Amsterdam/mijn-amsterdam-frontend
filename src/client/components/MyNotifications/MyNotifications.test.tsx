import { BrowserRouter } from 'react-router-dom';
import MyNotifications from './MyNotifications';
import React from 'react';
import { shallow } from 'enzyme';
import { MyNotification } from '../../../universal/types';
import * as profileTypeHook from '../../hooks/useProfileType';

const NOTIFICATIONS: MyNotification[] = [];

describe('<MyNotifications />', () => {
  const profileTypeHookMock = ((profileTypeHook as any).useProfileTypeValue = jest.fn(
    () => 'prive'
  ));

  afterAll(() => {
    profileTypeHookMock.mockRestore();
  });

  it('Renders without crashing', () => {
    shallow(
      <BrowserRouter>
        <MyNotifications
          trackCategory="myNotifications"
          items={NOTIFICATIONS}
        />
      </BrowserRouter>
    );
  });
  it('Matches the snapshot', () => {
    const comp = shallow(
      <BrowserRouter>
        <MyNotifications
          trackCategory="myNotifications"
          items={NOTIFICATIONS}
        />
      </BrowserRouter>
    );
    expect(comp.html()).toMatchSnapshot();
  });
});
