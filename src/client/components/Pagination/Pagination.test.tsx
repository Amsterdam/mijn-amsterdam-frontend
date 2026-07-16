import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { PaginationV2 } from './PaginationV2.tsx';

const mocks = vi.hoisted(() => {
  return {
    navigate: vi.fn(),
    IS_PRODUCTION: false,
  };
});

vi.mock('react-router', async (importOriginal) => {
  const module: object = await importOriginal();
  return {
    ...module,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../../universal/config/env.ts', async (importActual) => {
  return {
    ...(await importActual()),
    get IS_PRODUCTION() {
      return mocks.IS_PRODUCTION;
    },
  };
});

describe('<Pagination />', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.IS_PRODUCTION = false;
  });

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

  it('supports routes ending with optional :page? in production', async () => {
    const user = userEvent.setup();
    mocks.IS_PRODUCTION = true;

    render(
      <PaginationV2
        totalCount={10}
        pageSize={2}
        currentPage={1}
        path="/mijn-contact/contactmomenten/:page?"
      />
    );

    await user.click(screen.getAllByRole('link')[1]);
    expect(mocks.navigate).toHaveBeenCalledWith(
      '/mijn-contact/contactmomenten/2'
    );
  });

  it('throws for optional :page? outside production', () => {
    mocks.IS_PRODUCTION = false;
    expect(() =>
      render(
        <PaginationV2
          totalCount={10}
          pageSize={2}
          currentPage={1}
          path="/mijn-contact/contactmomenten/:page?"
        />
      )
    ).toThrow(
      "Unparsed router path encountered: '/mijn-contact/contactmomenten/:page?'"
    );
  });

  it('throws for non-optional param :page', () => {
    mocks.IS_PRODUCTION = true;
    expect(() =>
      render(
        <PaginationV2
          totalCount={10}
          pageSize={2}
          currentPage={1}
          path="/mijn-contact/:page"
        />
      )
    ).toThrow("Unparsed router path encountered: '/mijn-contact/:page'");
  });

  it('throws for optional params other than :page?', () => {
    mocks.IS_PRODUCTION = true;
    expect(() =>
      render(
        <PaginationV2
          totalCount={10}
          pageSize={2}
          currentPage={1}
          path="/mijn-contact/:kind?"
        />
      )
    ).toThrow("Unparsed router path encountered: '/mijn-contact/:kind?'");
  });
});
