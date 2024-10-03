import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import Pagination from './Pagination';

describe('<Pagination />', () => {
  const onPageClick = vi.fn();
  it('Renders without crashing', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Pagination
        totalCount={10}
        onPageClick={onPageClick}
        pageSize={2}
        currentPage={1}
      />
    );
    expect(
      screen.getByLabelText('Huidige pagina, pagina 1')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Ga naar pagina 2')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Ga naar pagina 2'));
    expect(onPageClick).toHaveBeenCalledWith(2);

    rerender(
      <Pagination
        totalCount={10}
        onPageClick={onPageClick}
        pageSize={2}
        currentPage={2}
      />
    );
    expect(
      screen.getByLabelText('Huidige pagina, pagina 2')
    ).toBeInTheDocument();
  });
});
