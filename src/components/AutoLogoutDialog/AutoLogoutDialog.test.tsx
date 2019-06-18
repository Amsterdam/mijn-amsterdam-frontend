import React from 'react';
import { shallow } from 'enzyme';
import AutoLogoutDialog from './AutoLogoutDialog';

it('Renders without crashing', () => {
  shallow(<AutoLogoutDialog />);
});
