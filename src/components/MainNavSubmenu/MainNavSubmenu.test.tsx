import React from 'react';
import { shallow } from 'enzyme';
import MainNavSubmenu from './MainNavSubmenu';

const SUBMENU_TITLE = 'submenutje';

it('Renders without crashing', () => {
  shallow(
    <MainNavSubmenu title={SUBMENU_TITLE} onMouseLeave={() => 0}>
      <a href="#">Linkje</a>
    </MainNavSubmenu>
  );
});
