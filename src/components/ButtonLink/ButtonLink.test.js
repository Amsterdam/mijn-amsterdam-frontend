import React from 'react';
import { shallow } from 'enzyme';
import ButtonLink from './ButtonLink';

it('Renders without crashing', () => {
  shallow(<ButtonLink />);
});
