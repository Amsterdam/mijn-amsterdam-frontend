import { render, screen } from '@testing-library/react';
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
    const { asFragment } = render(
      <BrowserRouter>
        <Linkd href="/">Link!</Linkd>
      </BrowserRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Linkd default renders correctly', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Linkd href="/">
          <IconComponent />
        </Linkd>
      </BrowserRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Linkd external renders correctly', () => {
    const { asFragment } = render(
      <Linkd external={true} href="/">
        Link!
      </Linkd>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
