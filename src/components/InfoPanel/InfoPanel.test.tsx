import React from 'react';
import { shallow } from 'enzyme';
import InfoPanel from './InfoPanel';

const INFO_DATA = {
  foo: 'bar',
};

it('Renders without crashing', () => {
  shallow(<InfoPanel infoData={INFO_DATA} />);
});
