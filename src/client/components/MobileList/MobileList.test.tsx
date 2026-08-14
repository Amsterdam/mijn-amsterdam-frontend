import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import {
  LinkOrFragment,
  getLabelValue,
  getTitleAttribute,
  ListDivider,
  MobileList,
} from './MobileList.tsx';

const mockUseDisplayPropsEntries = vi.fn();

vi.mock('../Table/useDisplayPropEntries.hook.ts', () => ({
  useDisplayPropsEntries: (...args: unknown[]) =>
    mockUseDisplayPropsEntries(...args),
}));

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

describe('MobileList helpers', () => {
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

describe('MobileList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDisplayPropsEntries.mockReturnValue([
      ['title', { label: 'Titel', width: undefined }],
      ['status', { label: 'Status', width: undefined }],
    ]);
  });

  it('renders caption, optional content and items', () => {
    render(
      <MobileList
        caption="Mijn zaken"
        contentAfterTheCaption={<span>Extra info</span>}
        items={[
          {
            id: 1,
            title: 'Zaak A',
            status: 'Open',
            link: { title: 'Zaak A', to: '/zaken/1' },
          },
          { id: 2, title: 'Zaak B', status: 'Gesloten' },
        ]}
        className="custom-class"
        displayProps={{} as never}
      />
    );

    expect(screen.getByText('Mijn zaken')).toBeInTheDocument();
    expect(screen.getByText('Extra info')).toBeInTheDocument();
    expect(screen.getByText('Zaak A')).toBeInTheDocument();
    expect(screen.getByText('Zaak B')).toBeInTheDocument();
    expect(screen.getAllByText('Status:')).toHaveLength(2);
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Gesloten')).toBeInTheDocument();
  });

  it('uses router link for internal links and no link when link is missing', () => {
    render(
      <MobileList
        caption="Lijst"
        items={[
          {
            id: 1,
            title: 'Zaak A',
            status: 'Open',
            link: { title: 'Zaak A', to: '/zaken/1' },
          },
          { id: 2, title: 'Zaak B', status: 'Gesloten' },
        ]}
        displayProps={{} as never}
      />
    );

    expect(screen.getAllByTestId('internal-link')).toHaveLength(1);
  });
});
