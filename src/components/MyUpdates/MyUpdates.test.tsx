import React from 'react';
import { shallow } from 'enzyme';
import MyUpdates from './MyUpdates';
import { MyUpdate } from '../../hooks/api/my-updates-api.hook';

const MY_UPDATES: MyUpdate[] = [];
const MY_UPDATES_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(<MyUpdates items={MY_UPDATES} total={MY_UPDATES_TOTAL} />);
});
