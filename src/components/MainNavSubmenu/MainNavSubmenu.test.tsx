import React from 'react';
import { shallow } from 'enzyme';
import MainNavSubmenu from './MainNavSubmenu';
import { BrowserRouter } from 'react-router-dom';

const SUBMENU_TITLE = 'submenutje';

it('Renders without crashing', () => {
  shallow(
    <BrowserRouter>
      <MainNavSubmenu title={SUBMENU_TITLE} id="een-submenu">
        <a href="#">Linkje</a>
      </MainNavSubmenu>
    </BrowserRouter>
  );
});
