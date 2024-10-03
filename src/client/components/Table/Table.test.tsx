import { render, screen } from '@testing-library/react';

import Table from './Table';

const items = [
  {
    title: 'Title 1',
    date: '2019-08-06',
  },
  {
    title: 'Foo the world',
    date: '2013-08-06',
  },
];

describe('<Table />', () => {
  it('Renders the default', () => {
    render(<Table items={items} />);
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Foo the world')).toBeInTheDocument();
  });

  it('Uses a different title key', () => {
    const nItems = [...items].map(({ title, ...item }) => {
      return {
        ...item,
        name: title,
      };
    });
    render(<Table titleKey="name" items={nItems} />);
    expect(screen.getByText('Title 1')).toBeInTheDocument();
  });
});
