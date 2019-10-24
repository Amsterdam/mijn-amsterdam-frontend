import React from 'react';
import { shallow, mount } from 'enzyme';
import Linkd from './Button';
import renderer from 'react-test-renderer';
import { ReactComponent as IconComponent } from 'assets/icons/Alert.svg';
import { BrowserRouter } from 'react-router-dom';

describe('Linkd', () => {
  it('Renders without crashing', () => {
    shallow(
      <BrowserRouter>
        <Linkd href="/">Link!</Linkd>
      </BrowserRouter>
    );
  });

  it('Renders', () => {
    const component = shallow(
      <BrowserRouter>
        <Linkd href="/">Link!</Linkd>
      </BrowserRouter>
    );
    expect(component.html()).toMatchSnapshot();
  });

  it('Linkd default renders correctly', () => {
    const component = renderer.create(
      <BrowserRouter>
        <Linkd href="/">
          <IconComponent />
        </Linkd>
      </BrowserRouter>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('Linkd external renders correctly', () => {
    const component = mount(
      <Linkd external={true} target="_blank" href="/">
        Link!
      </Linkd>
    );
    expect(component.html()).toMatchSnapshot();
    expect(component.getDOMNode().getAttribute('rel')).toBe(
      'external noopener noreferrer'
    );
    expect(component.getDOMNode().getAttribute('target')).toBe('_blank');
  });
});
