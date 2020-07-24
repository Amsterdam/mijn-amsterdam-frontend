import React from 'react';
import { shallow } from 'enzyme';
import ErrorMessages from './ErrorMessages';
import { RecoilRoot } from 'recoil';

const DUMMY_ERRORS = [
  {
    name: 'Een api naam',
    error: 'De server reageert niet',
    stateKey: 'API_NAAM',
  },
];

describe('<ErrorMessages />', () => {
  const Component = () => (
    <RecoilRoot>
      <ErrorMessages errors={DUMMY_ERRORS} />
    </RecoilRoot>
  );
  it('Renders without crashing', () => {
    expect(shallow(<Component />).html()).toMatchSnapshot();
  });
});
