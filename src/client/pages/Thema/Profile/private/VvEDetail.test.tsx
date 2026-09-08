import { render, screen } from '@testing-library/react';

import { VvEDetail } from './VvEDetail.tsx';
import type { WonenDataFrontend } from '../../../../../server/services/wonen/wonen.types.ts';
import type { AppState } from '../../../../../universal/types/App.types.ts';
import { MockApp } from '../../../MockApp.tsx';
import { themaConfig } from '../Profile-thema-config.ts';

const routeEntry = themaConfig.BRP.detailPageVvE.route.path;
const routePath = themaConfig.BRP.detailPageVvE.route.path;

const wonenDataWithCases = {
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
        id: 101,
        legacyId: 'L-101',
        prefixedDossierId: 'ZWD-101',
        adviceType: 'Verduurzamingsadvies',
        applicationType: 'Aanvraag',
        created: '2026-05-01T09:00:00.000Z',
        requestDate: '2026-05-02',
        endDate: '2026-06-02',
        status: 'In behandeling',
        updated: '2026-06-03T09:50:53.447114Z',
        activationTeam: {
          type: 'Team',
          subject: 'Opstart',
          meetingDate: '2026-06-04',
        },
        homeownerAssociation: {
          id: 555,
          name: 'VvE Prachtige Straat 13',
          district: 'Centrum',
          neighborhood: 'Grachtengordel',
          numberOfApartments: 21,
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
    render(<Component />);

    expect({
      title: screen.getByRole('heading', { name: 'Vereniging van Eigenaren' })
        .textContent,
      naam: screen.getByText('VvE Prachtige Straat 13').textContent,
      bouwjaar: screen.getByText('1926').textContent,
      kvk: screen.getByText('12345678').textContent,
      hasTerugmeldenLink: !!screen.getByRole('link', {
        name: 'Terugmelden op basisgegevens en stelselrelaties',
      }),
    }).toMatchInlineSnapshot(`
      {
        "bouwjaar": "1926",
        "hasTerugmeldenLink": true,
        "kvk": "12345678",
        "naam": "VvE Prachtige Straat 13",
        "title": "Vereniging van Eigenaren",
      }
    `);
  });
});
