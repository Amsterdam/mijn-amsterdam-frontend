import React from 'react';
import { shallow } from 'enzyme';
import Section from './Section';

it('Renders without crashing', () => {
  shallow(
    <Section>
      <p>Hey!</p>
    </Section>
  );
});
