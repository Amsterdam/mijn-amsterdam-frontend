import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { PaginationV2 } from './PaginationV2';

describe('<Pagination />', () => {
  const onPageClick = vi.fn();
  it('Renders without crashing', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <PaginationV2
        totalCount={10}
        onPageClick={onPageClick}
        pageSize={2}
        currentPage={1}
      />
    );
    expect(screen.getByText('Pagina 1')).toBeInTheDocument();
    expect(
      screen.getByText('Pagina 1').parentElement?.getAttribute('aria-current')
    ).toBe('true');
    expect(screen.getByText('Ga naar pagina 2')).toBeInTheDocument();

    await user.click(screen.getByText('Ga naar pagina 2'));
    expect(onPageClick).toHaveBeenCalledWith(2);

    rerender(
      <PaginationV2
        totalCount={10}
        onPageClick={onPageClick}
        pageSize={2}
        currentPage={2}
      />
    );
    expect(screen.getByText('Pagina 2')).toBeInTheDocument();
    expect(
      screen.getByText('Pagina 2').parentElement?.getAttribute('aria-current')
    ).toBe('true');
  });
});
