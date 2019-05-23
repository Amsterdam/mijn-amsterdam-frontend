import React from 'react';
import { shallow } from 'enzyme';
import ErrorMessages from './ErrorMessages';

const DUMMY_ERRORS = [
  {
    name: 'Een api naam',
    error: 'De server reageert niet',
  },
];

it('Renders without crashing', () => {
  shallow(<ErrorMessages errors={DUMMY_ERRORS} />);
});
