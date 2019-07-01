import React from 'react';
import { shallow } from 'enzyme';
import StatusLine, { StatusLineItem } from './StatusLine';
import { BrowserRouter } from 'react-router-dom';

const ITEMS: StatusLineItem[] = [];

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <StatusLine items={ITEMS} trackCategory="Test/Status_line" />
    </BrowserRouter>
  );
});
