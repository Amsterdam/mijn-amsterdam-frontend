import { render, screen, within } from '@testing-library/react';

import { VvEDetail } from './VvEDetail.tsx';
import type { WonenDataFrontend } from '../../../../../../../server/services/wonen/wonen.types.ts';
import type { AppState } from '../../../../../../../universal/types/App.types.ts';
import { MockApp } from '../../../MockApp.tsx';
import { themaConfig } from '../Profile-thema-config.ts';

const routeEntry = themaConfig.BRP.detailPageVvE.route.path;
const routePath = themaConfig.BRP.detailPageVvE.route.path;

const wonenDataWithCases: WonenDataFrontend = {
  vve: {
    name: 'VvE Prachtige Straat 13',
    numberOfApartments: 21,
    buildYear: 1926,
    beschermdStadsdorpsgezicht: 'Ja',
    kvkNummer: '12345678',
    monumentStatus: true,
    district: 'Centrum',
    neighborhood: 'Grachtengordel',
    bagId: '0363010000801903',
    ligtInBeschermdGebied: 'Ja',
    isPriorityNeighborhood: false,
    cases: [
      {
        id: 'ZWD-101',
        title: 'VvE verduurzamingsadvies',
        steps: [],
        link: {
          to: '/persoonlijke-gegevens/vve',
          title: 'Bekijk details',
        },
        displayStatus: 'In behandeling',
        dateStart: '2026-05-01T09:00:00.000Z',
        formattedDateStart: '1 mei 2026',
        dateUpdated: '2026-06-03T09:50:53.447114Z',
        datePublished: '2026-06-03T09:50:53.447114Z',
        status: 'In behandeling',
        adviceType: 'Verduurzamingsadvies',
        homeownerAssociation: {
          name: 'VvE Prachtige Straat 13',
        },
      },
    ],
  },
} as unknown as WonenDataFrontend;

function Component() {
  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={VvEDetail}
      state={
        {
          BRP: {
            status: 'OK',
            content: {
              persoon: { mokum: true },
              adres: {
                straatnaam: 'Prachtige Straat',
                huisnummer: '13',
                landnaam: 'Nederland',
              },
            },
          },
          KVK: { status: 'OK', content: null },
          WONEN: { status: 'OK', content: wonenDataWithCases },
        } as AppState
      }
    />
  );
}

describe('VvEDetail', () => {
  test('Matches snapshot with VvE cases', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the VvE case application, case number, start date, and status', () => {
    render(<Component />);

    const table = screen.getByRole('table');
    const row = within(table).getAllByRole('row')[1];

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Aanvraag', 'Zaaknummer', 'Startdatum', 'Status']);

    expect(
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual([
      'VvE verduurzamingsadvies',
      'ZWD-101',
      '1 mei 2026',
      'In behandeling',
    ]);
  });
});
