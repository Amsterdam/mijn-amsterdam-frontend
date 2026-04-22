import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
  it.only('Renders without crashing', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <PaginationV2
        totalCount={10}
        pageSize={2}
        currentPage={1}
        path="/thema/lijst"
      />
    );
    expect(screen.getAllByRole('link')[0]?.innerText).toBe('Pagina 1');
    expect(screen.getAllByRole('link')[0].getAttribute('aria-current')).toBe(
      'page'
    );
    expect(screen.getAllByRole('link')[1]?.innerText).toBe('Ga naar pagina 2');

    await user.click(screen.getAllByRole('link')[1]);
    expect(mocks.navigate).toHaveBeenCalledWith('/thema/lijst/2');

    rerender(
      <PaginationV2
        totalCount={10}
        pageSize={2}
        currentPage={2}
        path="/thema/lijst"
      />
    );
    expect(screen.getAllByRole('link')[2]?.innerText).toBe('Pagina 2');
    await user.click(screen.getAllByRole('link')[3]);
    expect(mocks.navigate).toHaveBeenCalledWith('/thema/lijst/3');
  });
});
