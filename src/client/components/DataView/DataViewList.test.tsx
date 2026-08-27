import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import {
  LinkOrFragment,
  formatPropValueForDisplay,
  getTitleAttribute,
  DataViewList,
} from './DataViewList.tsx';

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

describe('DataView helpers', () => {
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

  test('formatPropValueForDisplay returns React elements unchanged', () => {
    function Label() {
      return <span>Label</span>;
    }
    const element = <Label />;

    expect(formatPropValueForDisplay<typeof element>(element)).toBe(element);
  });

  test('formatPropValueForDisplay returns mixed React-node arrays unchanged', () => {
    const mixedValue = [
      '€ 1.000,00 betaaltermijn verstreken',
      <br key="line-break" />,
      <strong key="warning">Let op!</strong>,
    ];
    const result = formatPropValueForDisplay<{ mixedValue: React.ReactNode[] }>(
      mixedValue
    );
    expect(result).toStrictEqual(mixedValue);
  });

  test('formatPropValueForDisplay stringifies objects', () => {
    const testObject = { label: 'value' };
    const testElementObject = { label: testObject };

    expect(
      formatPropValueForDisplay<typeof testElementObject>(
        testElementObject.label
      )
    ).toBe('{"label":"value"}');
  });

  test('formatPropValueForDisplay stringifies primitives', () => {
    const testNumber = 42;
    const testElementNumber = { label: testNumber };

    expect(
      formatPropValueForDisplay<typeof testElementNumber>(
        testElementNumber.label
      )
    ).toBe('42');

    const testBoolean = true;
    const testElementBoolean = { label: testBoolean };

    expect(
      formatPropValueForDisplay<typeof testElementBoolean>(
        testElementBoolean.label
      )
    ).toBe('true');
  });

  test('formatPropValueForDisplay returns fallback for undefined and null', () => {
    const testElement = { label: null };

    expect(
      formatPropValueForDisplay<typeof testElement>(testElement.label)
    ).toBe('');
    expect(formatPropValueForDisplay<{ value?: string }>(undefined)).toBe('');
  });

  test('getTitleAttribute prefers first displayProp key, then title, then first truthy primitive field', () => {
    expect(
      getTitleAttribute(
        [{ title: 'Zaaknaam', id: 1, name: 'Andere naam' }],
        [
          ['name', { label: 'Naam' }],
          ['foo', { label: 'Foo' }],
        ]
      )
    ).toBe('name');

    expect(getTitleAttribute([{ title: 'Zaaknaam', id: 1 }], [])).toBe('title');

    expect(
      getTitleAttribute(
        [
          {
            title: '',
            name: 'Zaaknaam',
            status: 'Open',
          },
        ],
        []
      )
    ).toBe('title');
  });
});

describe('DataViewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDisplayPropsEntries.mockReturnValue([
      ['title', { label: 'Titel', width: undefined }],
      ['status', { label: 'Status', width: undefined }],
    ]);
  });

  it('renders caption, optional content and items', () => {
    render(
      <DataViewList
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
      <DataViewList
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
