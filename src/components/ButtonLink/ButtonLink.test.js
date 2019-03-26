import React from 'react';
import { shallow, mount } from 'enzyme';
import ButtonLink, { IconButtonLink, ButtonLinkExternal } from './ButtonLink';
import renderer from 'react-test-renderer';
import { ReactComponent as IconComponent } from 'assets/icons/Alert.svg';
import { BrowserRouter } from 'react-router-dom';

describe('ButtonLink', () => {
  it('Renders without crashing', () => {
    shallow(
      <BrowserRouter>
        <ButtonLink to="/" />
      </BrowserRouter>
    );
  });

  it('Renders', () => {
    const component = shallow(
      <BrowserRouter>
        <ButtonLink to="/" />
      </BrowserRouter>
    );
    expect(component.html()).toMatchSnapshot();
  });

  it('ButtonLink default renders correctly', () => {
    const component = renderer.create(
      <BrowserRouter>
        <IconButtonLink to="/">
          <IconComponent />
        </IconButtonLink>
      </BrowserRouter>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('ButtonLink external renders correctly', () => {
    const component = mount(<ButtonLinkExternal to="/" />);
    expect(component.html()).toMatchSnapshot();
    expect(component.getDOMNode().getAttribute('rel')).toBe(
      'noopener noreferrer'
    );
  });
});
