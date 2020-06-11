import React from 'react';
import { shallow } from 'enzyme';
import Panel from './Panel';

it('Renders without crashing', () => {
  shallow(
    <Panel>
      <p>hey!</p>
    </Panel>
  );
});
