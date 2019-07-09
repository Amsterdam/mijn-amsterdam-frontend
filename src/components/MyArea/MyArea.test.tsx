import React from 'react';
import { shallow } from 'enzyme';
import MyArea from './MyArea';

const SAMPLE_ADDRESS = 'teststraat 1';

it('Renders without crashing', () => {
  shallow(<MyArea trackCategory="test" address={SAMPLE_ADDRESS} />);
});
