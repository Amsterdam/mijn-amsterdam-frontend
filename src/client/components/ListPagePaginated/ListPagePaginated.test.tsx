import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, it, expect } from 'vitest';

import { ListPagePaginated } from './ListPagePaginated';
import type { DisplayProps } from '../Table/TableV2.types';

type TestItem = {
  id: number;
  name: string;
};

const mockItems: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

const mockDisplayProps: DisplayProps<TestItem> = {
  props: {
    id: 'ID',
    name: 'Name',
  },
};

const renderWithRouter = (ui: React.ReactNode, route: string) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/test/:page?" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ListPagePaginated', () => {
  it('renders the title and breadcrumbs', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        breadcrumbs={[{ title: 'Themapagina', to: '/thema' }]}
        displayProps={mockDisplayProps}
        items={mockItems}
        isError={false}
        isLoading={false}
        themaId="test"
      />,
      '/test'
    );

    expect(screen.getAllByText('Test Title')).toHaveLength(2);
    expect(screen.getByText('Themapagina')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('displays a loading state', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        displayProps={mockDisplayProps}
        items={mockItems}
        isError={false}
        isLoading={true}
        themaId="test"
      />,
      '/test'
    );

    expect(screen.getByText(/Inhoud wordt opgehaald/i)).toBeInTheDocument();
  });

  it('displays an error message when isError is true', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        displayProps={mockDisplayProps}
        items={mockItems}
        isError={true}
        isLoading={false}
        errorText="Custom error message"
        themaId="test"
      />,
      '/test'
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('displays no items text when there are no items', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        displayProps={mockDisplayProps}
        items={[] as TestItem[]}
        isError={false}
        isLoading={false}
        noItemsText="No items available"
        themaId="test"
      />,
      '/test'
    );

    expect(screen.getByText('No items available')).toBeInTheDocument();
  });

  it('renders paginated items', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        displayProps={mockDisplayProps}
        items={mockItems}
        isError={false}
        isLoading={false}
        pageSize={10}
        themaId="test"
      />,
      '/test/2'
    );

    expect(screen.getByText('Item 11')).toBeInTheDocument();
    expect(screen.getByText('Item 20')).toBeInTheDocument();
  });

  it('renders pagination controls when items exceed page size', () => {
    renderWithRouter(
      <ListPagePaginated
        appRoute="/test"
        title="Test Title"
        displayProps={mockDisplayProps}
        items={mockItems}
        isError={false}
        isLoading={false}
        pageSize={10}
        themaId="test"
      />,
      '/test'
    );

    expect(screen.getAllByText(/Ga naar pagina/i)).toHaveLength(28); // 50 items, 10 per page
  });
});
