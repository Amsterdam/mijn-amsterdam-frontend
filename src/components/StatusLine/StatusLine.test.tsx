import React from 'react';
import { shallow } from 'enzyme';
import StatusLine, { StatusLineItem } from './StatusLine';

const ITEMS: StatusLineItem[] = [];

it('Renders without crashing', () => {
  shallow(<StatusLine items={ITEMS} />);
});
