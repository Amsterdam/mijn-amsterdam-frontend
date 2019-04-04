import React from 'react';
import { shallow } from 'enzyme';
import MyChaptersPanel from './MyChaptersPanel';

it('Renders without crashing', () => {
  shallow(<MyChaptersPanel />);
});
