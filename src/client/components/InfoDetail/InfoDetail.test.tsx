import InfoDetail from './InfoDetail';

import { render, screen } from '@testing-library/react';

it('Renders without crashing', () => {
  const { container } = render(
    <InfoDetail label="Foo" value="Bar" el="article" />
  );
  expect(screen.getByText('Foo')).toBeInTheDocument();
  expect(screen.getByText('Bar')).toBeInTheDocument();
  expect((container.firstChild as any).tagName).toBe('ARTICLE');
});
