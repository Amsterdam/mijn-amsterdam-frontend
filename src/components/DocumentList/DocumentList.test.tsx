import React from 'react';
import { shallow } from 'enzyme';
import DocumentList from './DocumentList';
import { MyUpdate } from 'hooks/api/my-updates-api.hook';

const MY_UPDATES: MyUpdate[] = [];
const MY_UPDATES_TOTAL = 10;

it('Renders without crashing', () => {
  shallow(<DocumentList items={MY_UPDATES} total={MY_UPDATES_TOTAL} />);
});
