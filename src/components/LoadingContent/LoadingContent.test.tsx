import React from 'react';
import { shallow } from 'enzyme';
import LoadingContent from './LoadingContent';

it('Renders without crashing', () => {
  shallow(<LoadingContent />);
});
