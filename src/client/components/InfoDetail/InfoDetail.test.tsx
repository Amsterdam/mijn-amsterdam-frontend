import InfoDetail from './InfoDetail';

import { render, screen } from '@testing-library/react';

it('Renders without crashing', () => {
  const { container } = render(
    <InfoDetail label="Foo" value="Bar" valueWrapperElement="article" />
  );
  expect(screen.getByText('Foo')).toBeInTheDocument();
  expect(screen.getByText('Bar')).toBeInTheDocument();
  expect((container.firstChild?.childNodes[1] as any).tagName).toBe('ARTICLE');
});
