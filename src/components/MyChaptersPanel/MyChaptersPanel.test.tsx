import React from 'react';
import { shallow } from 'enzyme';
import MyChaptersPanel from './MyChaptersPanel';

const PANEL_TITLE = 'whoa!';

it('Renders without crashing', () => {
  shallow(<MyChaptersPanel title={PANEL_TITLE} />);
});
