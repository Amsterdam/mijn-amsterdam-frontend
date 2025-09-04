import { render, within } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { routeConfig } from './ToeristischeVerhuur-thema-config';
import { ToeristischeVerhuurThema } from './ToeristischeVerhuurThema';
import type { BBVergunningFrontend } from '../../../../server/services/toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types';
import type { VakantieverhuurVergunningFrontend } from '../../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types';
import { jsonCopy } from '../../../../universal/helpers/utils';
import { AppState } from '../../../../universal/types/App.types';
import { expectHeaders, getTable } from '../../../helpers/test-utils';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

function getVergunningen<
  T = VakantieverhuurVergunningFrontend | BBVergunningFrontend,
>(title: string, identifierPrefix: 'Z' | 'T') {
  return [
    // Ontvangen
    {
      identifier: `${identifierPrefix}/123/456`,
      displayStatus: 'Ontvangen',
      processed: false,
      dateRequest: '2021-01-01T10:47:44.6107122',
      dateRequestFormatted: '1 januari 2021',
      title,
      steps: [],
      isExpired: false,
      isVerleend: false,
      link: {
        to: '/vergunningen/vergunningen/123456',
      },
    } as unknown as T,
    // In behandeling
    {
      identifier: `${identifierPrefix}/456/789`,
      displayStatus: 'In behandeling',
      processed: false,
      dateRequest: '2022-06-01T10:47:44.6107122',
      dateRequestFormatted: '01 juni 2022',
      title,
      steps: [],
      isExpired: false,
      isVerleend: false,
      link: {
        to: '/vergunningen/vergunningen/456789',
      },
    } as unknown as T,
    // Active permits 22-09-2021
    {
      identifier: `${identifierPrefix}/789/012`,
      displayStatus: 'Verleend',
      decision: 'Verleend',
      processed: true,
      dateRequest: '2022-06-01T10:47:44.6107122',
      dateRequestFormatted: '01 juni 2022',
      dateEnd: '2023-06-01T10:47:44.6107122',
      dateEndFormatted: '01 juni 2023',
      dateStart: '2022-07-01T10:47:44.6107122',
      dateStartFormatted: '01 juli 2022',
      dateDecision: '2022-06-10T10:47:44.6107122',
      title,
      isExpired: false,
      isVerleend: true,
      steps: [{ status: 'Verlopen', isActive: false }],
      link: {
        to: '/vergunningen/vergunningen/789012',
      },
    } as unknown as T,
    // Verlopen permit
    {
      identifier: `${identifierPrefix}/012/345`,
      displayStatus: 'Verleend',
      decision: 'Verleend',
      processed: true,
      dateRequest: '2020-06-01T10:47:44.6107122',
      dateRequestFormatted: '01 juni 2020',
      dateEnd: '2021-06-01T10:47:44.6107122',
      dateEndFormatted: '01 juni 2021',
      dateDecision: '2020-06-10T10:47:44.6107122',
      title,
      isExpired: true,
      isVerleend: true,
      steps: [{ status: 'Verlopen', isActive: true }],
      link: {
        to: '/vergunningen/vergunningen/012345',
      },
    } as unknown as T,
  ];
}

const verhuurContent: AppState['TOERISTISCHE_VERHUUR']['content'] = {
  lvvRegistraties: [
    {
      address: 'Amstel 1 1017AB Amsterdam',
      registrationNumber: 'E7B8 B042 8A92 37E5 0363',
      agreementDate: '2021-01-01T10:47:44.6107122',
      agreementDateFormatted: '1 januari 2021',
    },
    {
      address: 'Amstel 1 1017AB Amsterdam',
      registrationNumber: 'BBBBBBBBBBBBBBBBBBBB',
      agreementDate: '2021-01-01T10:47:44.6107122',
      agreementDateFormatted: '1 januari 2021',
    },
  ],
  vakantieverhuurVergunningen:
    getVergunningen<VakantieverhuurVergunningFrontend>(
      'Vergunning vakantieverhuur',
      'Z'
    ),
  bbVergunningen: getVergunningen<BBVergunningFrontend>(
    'Vergunning bed & breakfast',
    'T'
  ),
};

const getTestState = () =>
  jsonCopy({
    TOERISTISCHE_VERHUUR: {
      content: verhuurContent,
      status: 'OK',
    },
  }) as AppState;

const testStateBase = getTestState();

function initializeState(snapshot: MutableSnapshot, state: AppState) {
  snapshot.set(appStateAtom, state);
}

describe('<ToeristischeVerhuurThema />', () => {
  const routeEntry = generatePath(routeConfig.themaPage.path);
  const routePath = routeConfig.themaPage.path;

  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristischeVerhuurThema}
        initializeState={(snap) => initializeState(snap, state)}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2021-09-22');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Shows page for B&B and Vakantieverhuur permits', () => {
    const screen = render(<Component state={testStateBase} />);

    expect(screen.getAllByText(/Toeristische verhuur/)[0]).toBeInTheDocument();
    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Registratienummer(s) toeristische verhuur').length
    ).toBe(1);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();

    const lopendeAanvraagTable = getTable(screen, 'Lopende aanvragen');

    expectHeaders(lopendeAanvraagTable, [
      'Zaaknummer',
      'Soort vergunning',
      'Status',
      'Aangevraagd op',
    ]);

    const withinLopendeAanvraagTable = within(lopendeAanvraagTable);

    expect(withinLopendeAanvraagTable.getByText('Z/123/456')).toBeDefined();
    expect(withinLopendeAanvraagTable.getByText('Z/456/789')).toBeDefined();
    expect(withinLopendeAanvraagTable.getByText('T/123/456')).toBeDefined();
    expect(withinLopendeAanvraagTable.getByText('T/456/789')).toBeDefined();

    const actieveVergunningTable = getTable(screen, 'Huidige vergunningen');

    expectHeaders(actieveVergunningTable, [
      'Zaaknummer',
      'Soort vergunning',
      'Vanaf',
      'Tot',
    ]);
    const withinActieveVergunningTable = within(actieveVergunningTable);

    expect(withinActieveVergunningTable.getByText('Z/789/012')).toBeDefined();
    expect(withinActieveVergunningTable.getByText('T/789/012')).toBeDefined();

    const eerdereVergunningTable = getTable(
      screen,
      'Eerdere en afgewezen vergunningen'
    );

    expectHeaders(eerdereVergunningTable, [
      'Zaaknummer',
      'Soort vergunning',
      'Status',
    ]);

    const withinEerdereVergunningTable = within(eerdereVergunningTable);

    expect(withinEerdereVergunningTable.getByText('Z/012/345')).toBeDefined();
    expect(withinEerdereVergunningTable.getByText('T/012/345')).toBeDefined();

    expect(
      screen.getByText(
        /Het is niet toegestaan om op hetzelfde adres zowel aan vakantieverhuur als bed/i
      )
    ).toBeInTheDocument();
  });

  it('Shows alert for missing registration numbers', () => {
    const testState2: AppState = getTestState();

    testState2.TOERISTISCHE_VERHUUR.content!.lvvRegistraties = [];

    const screen = render(<Component state={testState2} />);

    expect(
      screen.getByText(
        /U moet daarom ook een landelijk registratienummer voor toeristische verhuur aanvragen./
      )
    ).toBeInTheDocument();
  });

  it('Shows B&B page', () => {
    const testState3: AppState = getTestState();

    testState3.TOERISTISCHE_VERHUUR.content!.vakantieverhuurVergunningen = [];

    const screen = render(<Component state={testState3} />);

    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Meer informatie over bed & breakfast')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Vergunning vakantieverhuur')
    ).not.toBeInTheDocument();
  });

  it('Shows Vakantieverhuur page', () => {
    const testState4: AppState = getTestState();

    testState4.TOERISTISCHE_VERHUUR.content!.bbVergunningen = [];

    const screen = render(<Component state={testState4} />);

    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Meer informatie over particuliere vakantieverhuur')
    ).toBeInTheDocument();

    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(4);

    expect(
      screen.queryByText('Vergunning bed & breakfast')
    ).not.toBeInTheDocument();
  });
});
