import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import MyCases from './MyCases';
const ITEMS = [
  {
    id: 'test-id',
    datePublished: '2020-10-10',
    title: 'My test case',
    chapter: 'INKOMEN',
    link: {
      to: '/',
      title: 'Link title',
    },
  },
];

describe('<MyCases/>', () => {
  it('Shows cases when provided', () => {
    render(
      <MemoryRouter>
        <MyCases title="testje" items={ITEMS} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('testje')).toBeInTheDocument();
    expect(screen.getByText('My test case')).toBeInTheDocument();

    const { container } = render(
      <MemoryRouter>
        <MyCases title="testje" items={ITEMS} isLoading={true} />
      </MemoryRouter>
    );

    expect(
      container.querySelector('[class*="LoadingContent"]')
    ).toBeInTheDocument();
  });
  it('Shows a fallback text when no cases provided', () => {
    render(
      <MemoryRouter>
        <MyCases title="testje" items={[]} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/geen aanvragen/)).toBeInTheDocument();
  });
});
