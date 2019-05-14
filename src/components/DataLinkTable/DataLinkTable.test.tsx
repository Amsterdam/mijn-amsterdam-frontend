import React from 'react';
import { shallow } from 'enzyme';
import DataLinkTable from './DataLinkTable';

it('Renders without crashing', () => {
  shallow(<DataLinkTable id="testje" />);
});
