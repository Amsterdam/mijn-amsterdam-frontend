import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import {
  LinkOrFragment,
  getLabelValue,
  getTitleAttribute,
  ListDivider,
} from './ZakenList.tsx';

vi.mock('../MaLink/MaLink.tsx', () => ({
  MaLink: ({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a data-testid="external-link" href={href} className={className}>
      {children}
    </a>
  ),
  MaRouterLink: ({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a data-testid="internal-link" href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('ZakenList helpers', () => {
  test('LinkOrFragment renders plain children when no link is provided', () => {
    render(<LinkOrFragment>Alleen tekst</LinkOrFragment>);

    expect(screen.getByText('Alleen tekst')).toBeInTheDocument();
    expect(screen.queryByTestId('external-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('internal-link')).not.toBeInTheDocument();
  });

  test('LinkOrFragment uses MaLink for external links and MaRouterLink for internal links', () => {
    render(
      <LinkOrFragment link={{ title: 'extern', to: 'https://amsterdam.nl' }}>
        Extern
      </LinkOrFragment>
    );
    expect(screen.getByTestId('external-link')).toHaveAttribute(
      'href',
      'https://amsterdam.nl'
    );
    expect(screen.getByText('Extern')).toBeInTheDocument();

    render(
      <LinkOrFragment link={{ title: 'intern', to: '/intern' }}>
        Intern
      </LinkOrFragment>
    );
    expect(screen.getByTestId('internal-link')).toHaveAttribute(
      'href',
      '/intern'
    );
    expect(screen.getByText('Intern')).toBeInTheDocument();
  });

  test('getLabelValue returns React elements unchanged', () => {
    const element = <span>Label</span>;

    expect(getLabelValue(element)).toBe(element);
  });

  test('getLabelValue stringifies objects and primitives', () => {
    expect(getLabelValue({ foo: 'bar' })).toBe('{"foo":"bar"}');
    expect(getLabelValue(42)).toBe('42');
    expect(getLabelValue(null)).toBe('null');
  });

  test('getTitleAttribute prefers title and falls back to the first truthy primitive field', () => {
    expect(getTitleAttribute([{ title: 'Zaaknaam', id: 1 }])).toBe('title');
    expect(
      getTitleAttribute([
        {
          title: '',
          name: 'Zaaknaam',
          status: 'Open',
        },
      ])
    ).toBe('name');
  });
});

describe('ListDivider', () => {
  it('renders a divider when the item is not the last in the list', () => {
    render(<ListDivider listLength={3} index={1} />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('does not render a divider for the last item in the list', () => {
    render(<ListDivider listLength={3} index={2} />);

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
