import React from 'react';
import { shallow } from 'enzyme';
import DocumentList, { Document } from './DocumentList';

const ITEMS: Document[] = [];

it('Renders without crashing', () => {
  shallow(<DocumentList items={ITEMS} />);
});
