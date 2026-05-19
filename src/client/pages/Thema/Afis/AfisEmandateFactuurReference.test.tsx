import { render, renderHook } from '@testing-library/react';
import { vi, describe, it, type Mock } from 'vitest';

import type { AfisFactuurFrontend } from './Afis-thema-config.ts';
import {
  AfisEmandateFactuurReference,
  useAfisEmandateFactuurReferenceContent,
} from './AfisEmandateFactuurReference.tsx';
import { useAfisEMandatesApi } from './useAfisEmandatesApi.tsx';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';

// Simplify routing link used by the component for tests
vi.mock('../../../components/MaLink/MaLink.tsx', () => ({
  MaRouterLink: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('./useAfisEmandatesApi.tsx');

describe('AfisEmandateFactuurReference', () => {
  const mockEMandate = {
    eMandateIdSource: 'EMANDATE123',
    link: { to: '/emandate/123', title: 'E-Mandate Detail' },
    status: '1',
    dateValidFromFormatted: '01 januari 2023',
    dateValidToFormatted: null,
    senderName: 'John Doe 23',
    senderIBAN: 'NL00BANK0123456789',
    history: [
      {
        eMandateIdSource: 'EMANDATE122',
        dateValidFromFormatted: '01 januari 2022',
        dateValidToFormatted: '31 december 2022',
        senderName: 'John Doe 22',
        senderIBAN: 'NL22BANK0123456789',
        status: '0',
      },
    ],
  } as unknown as AfisEMandateFrontend;

  (useAfisEMandatesApi as Mock).mockReturnValue({
    eMandates: [mockEMandate],
  });

  it('Renders a link with the correct href and text when eMandate is active', () => {
    expect(
      render(
        <AfisEmandateFactuurReference eMandate={mockEMandate} />
      ).asFragment()
    ).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          href="/emandate/123"
        >
          EMANDATE123
        </a>
      </DocumentFragment>
    `);
  });

  it('Renders a link with the correct href when eMandate is not active', () => {
    const inactiveEMandate = {
      ...mockEMandate,
      status: '0',
      dateValidToFormatted: '31-12-2023',
    } as unknown as AfisEMandateFrontend;
    expect(
      render(
        <AfisEmandateFactuurReference eMandate={inactiveEMandate} />
      ).asFragment()
    ).toMatchInlineSnapshot(`
      <DocumentFragment>
        <a
          href="/emandate/123#eerdere-emandaten"
        >
          EMANDATE123
        </a>
      </DocumentFragment>
    `);
  });

  describe('useAfisEmandateFactuurReferenceContent', () => {
    it('Returns null when no eMandateId or factuur is provided', () => {
      const { result } = renderHook(() =>
        useAfisEmandateFactuurReferenceContent()
      );
      expect(result.current).toBeNull();
    });

    it('Returns content when eMandateId and factuur are provided', () => {
      const factuur = { eMandateId: 'EMANDATE123' } as AfisFactuurFrontend; // Mock factuur with eMandateId
      const { result } = renderHook(() =>
        useAfisEmandateFactuurReferenceContent('EMANDATE123', factuur)
      );
      const rows = result.current ?? [];

      const screen = render(<Datalist rows={rows} />);
      expect(screen.getByText('EMANDATE123')).toBeInTheDocument();
      expect(
        screen.getByText('Actief sinds 01 januari 2023.')
      ).toBeInTheDocument();
    });

    it('Returns correct status for inactive eMandate', () => {
      const factuur = { eMandateId: 'EMANDATE122' } as AfisFactuurFrontend; // Mock factuur with eMandateId
      const { result } = renderHook(() =>
        useAfisEmandateFactuurReferenceContent('EMANDATE122', factuur)
      );
      const rows = result.current ?? [];

      const screen = render(<Datalist rows={rows} />);
      expect(screen.getByText('EMANDATE122')).toBeInTheDocument();
      expect(
        screen.getByText('Niet actief - gestopt op 31 december 2022.')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Handmatig betalen' })
      ).toBeInTheDocument();
    });
  });
});
