import React from 'react';
import { shallow } from 'enzyme';
import DocumentList from './DocumentList';
import { GenericDocument } from '../../../universal/types/App.types';

const ITEMS: GenericDocument[] = [];

it('Renders without crashing', () => {
  shallow(<DocumentList documents={ITEMS} />);
});
