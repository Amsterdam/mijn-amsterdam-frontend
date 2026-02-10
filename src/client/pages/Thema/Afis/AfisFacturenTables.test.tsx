import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';

import { AfisFacturenTables } from './AfisFacturenTables';
import {
  useAfisFacturenData,
  type AfisFacturenThemaContextParams,
} from './useAfisThemaData.hook';
import MockApp from '../../MockApp';

vi.mock('./useAfisThemaData.hook');

describe('AfisFacturenTables', () => {
  it('renders tables based on tableConfig', () => {
    const mockUseAfisFacturenData = {
      facturenByState: {
        open: {
          count: 15,
          facturen: [
            { id: 1, title: 'Factuur 1' },
            { id: 2, title: 'Factuur 2' },
            { id: 3, title: 'Factuur 3' },
            { id: 4, title: 'Factuur 4' },
            { id: 5, title: 'Factuur 5' },
            { id: 5, title: 'Factuur 6' },
          ],
        },
      },
      tableConfig: {
        open: {
          title: 'Open facturen',
          displayProps: {
            id: 'ID',
            title: 'Title',
          },
          maxItems: 5,
          listPageLinkLabel: 'View More',
          listPageRoute: '/open',
        },
      },
    };

    (useAfisFacturenData as Mock).mockReturnValue(mockUseAfisFacturenData);

    render(<MockApp component={AfisFacturenTables} />);

    expect(screen.getByText('Open facturen')).toBeInTheDocument();
    expect(screen.getByText('View More')).toBeInTheDocument();
    expect(screen.getByText('Factuur 1')).toBeInTheDocument();
    expect(screen.getByText('Factuur 5')).toBeInTheDocument();
    expect(screen.queryByText('Factuur 6')).not.toBeInTheDocument();
  });

  it('applies filters and mappings to facturen', () => {
    const mockUseAfisFacturenData = {
      facturenByState: {
        open: { count: 3, facturen: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      },
      tableConfig: {
        open: {
          title: 'Open facturen',
          displayProps: {},
          maxItems: 5,
          listPageLinkLabel: 'View More',
          listPageRoute: '/open',
        },
      },
    };

    const themaContextParams = {
      states: ['open'],
      factuurFilterFn: vi.fn((factuur) => factuur.id !== 2),
      factuurMapFn: vi.fn((factuur) => ({ ...factuur, mapped: true })),
      themaId: 'test-thema',
    } as unknown as AfisFacturenThemaContextParams;

    (useAfisFacturenData as Mock).mockReturnValue(mockUseAfisFacturenData);

    render(
      <MockApp
        component={() => (
          <AfisFacturenTables themaContextParams={themaContextParams} />
        )}
      />
    );

    expect(themaContextParams.factuurFilterFn).toHaveBeenCalled();
    expect(themaContextParams.factuurMapFn).toHaveBeenCalled();
    expect(screen.getByText('Open facturen')).toBeInTheDocument();
    expect(screen.queryByText('View More')).not.toBeInTheDocument();
  });
});
