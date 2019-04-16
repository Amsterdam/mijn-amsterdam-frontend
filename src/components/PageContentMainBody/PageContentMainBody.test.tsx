import React from 'react';
import { shallow } from 'enzyme';
import PageContentMainBody from './PageContentMainBody';

it('Renders without crashing', () => {
  shallow(<PageContentMainBody>Inhoud!</PageContentMainBody>);
});
