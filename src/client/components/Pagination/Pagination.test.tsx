import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { PaginationV2 } from './PaginationV2.tsx';

const mocks = vi.hoisted(() => {
  return {
    navigate: vi.fn(),
  };
});

vi.mock('react-router', async (importOriginal) => {
  const module: object = await importOriginal();
  return {
    ...module,
    useNavigate: () => mocks.navigate,
  };
});

describe('<Pagination />', () => {
  it('Renders without crashing', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <PaginationV2
        totalCount={10}
        pageSize={2}
        currentPage={1}
        path="/thema/lijst"
      />
    );
    expect(screen.getAllByText('Pagina 1')[0]).toBeInTheDocument();
    expect(
      screen
        .getAllByText('Pagina 1')[0]
        .parentElement?.parentElement?.getAttribute('aria-current')
    ).toBe('page');
    expect(screen.getAllByText('Ga naar pagina 2')[0]).toBeInTheDocument();

    await user.click(screen.getAllByText('Ga naar pagina 2')[0]);
    expect(mocks.navigate).toHaveBeenCalledWith('/thema/lijst/2');

    rerender(
      <PaginationV2
        totalCount={10}
        pageSize={2}
        currentPage={2}
        path="/thema/lijst"
      />
    );
    expect(screen.getAllByText('Pagina 2')[0]).toBeInTheDocument();
    expect(
      screen
        .getAllByText('Pagina 2')[0]
        .parentElement?.parentElement?.getAttribute('aria-current')
    ).toBe('page');
  });
});
