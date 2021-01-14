import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReactComponent as IconComponent } from '../../assets/icons/Alert.svg';
import Linkd from './Button';

describe('Linkd', () => {
  it('Renders without crashing', () => {
    render(
      <BrowserRouter>
        <Linkd href="/">Link!</Linkd>
      </BrowserRouter>
    );
    expect(screen.getByText('Link!')).toBeInTheDocument();
  });

  it('Renders', () => {
    const component = render(
      <BrowserRouter>
        <Linkd href="/">Link!</Linkd>
      </BrowserRouter>
    );
    expect(component.asFragment()).toMatchSnapshot();
  });

  it('Linkd default renders correctly', () => {
    const component = render(
      <BrowserRouter>
        <Linkd href="/">
          <IconComponent />
        </Linkd>
      </BrowserRouter>
    );
    expect(component.asFragment()).toMatchSnapshot();
  });

  it('Linkd external renders correctly', () => {
    const component = render(
      <Linkd external={true} target="_blank" href="/">
        Link!
      </Linkd>
    );
    expect(component.asFragment()).toMatchSnapshot();
  });
});
