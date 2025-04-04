import { render } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppRoutes } from '../../../universal/config/routes';
import { jsonCopy } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { ToeristscheVerhuurThema } from './ToeristischeVerhuur';

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
  vakantieverhuurVergunningen: [
    {
      id: 'Z-XXX-000007C',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      key: '123',
      processed: true,
      dateDecision: null,
      dateRequest: '2022-05-10',
      dateRequestFormatted: '2022-05-10',
      dateStart: '2022-08-01',
      dateStartFormatted: '01 augustus 2022',
      dateEnd: '2023-08-23',
      dateEndFormatted: '22 augustus 2023',
      decision: 'Verleend',
      identifier: 'Z/123/000007',
      location: 'Amstel 1 1017AB Amsterdam',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2022-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2022-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2022-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-4',
          status: 'Verlopen',
          datePublished: '2023-08-22',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      fetchDocumentsUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007C',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      status: 'Verleend',
      displayStatus: 'Verleend',
    },
    {
      id: 'Z-XXX-000007B',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      key: '127',
      dateDecision: null,
      dateRequest: '10 mei 2023',
      dateRequestFormatted: '10 mei 2023',
      dateStart: '01 augustus 2023',
      dateStartFormatted: '',
      dateEnd: '30 september 2024',
      dateEndFormatted: '',
      decision: 'Verleend',
      identifier: 'Z/123/0000077',
      location: 'Amstel 1 1017AB Amsterdam',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2023-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2023-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2023-05-10',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      fetchDocumentsUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007B',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      processed: true,
      status: 'Verleend',
      displayStatus: 'Verleend',
    },
    {
      id: 'Z-XXX-000007',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      key: '126',
      dateDecision: null,
      dateRequest: '10 mei 2020',
      dateRequestFormatted: '10 mei 2020',
      dateStart: '01 augustus 2020',
      dateStartFormatted: '',
      dateEnd: '30 september 2021',
      dateEndFormatted: '',
      location: 'Amstel 1 1017AB Amsterdam',
      decision: 'Verleend',
      identifier: 'Z/890/000007',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2020-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2020-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2020-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-4',
          status: 'Verlopen',
          datePublished: '2021-09-30',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      fetchDocumentsUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      processed: true,
      status: 'Verlopen',
      displayStatus: 'Verlopen',
    },
    {
      id: 'Z-001-000040',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      key: '1235',
      dateDecision: null,
      dateRequest: '10 mei 2021',
      dateRequestFormatted: '10 mei 2021',
      dateStart: '01 juni 2020',
      dateStartFormatted: '',
      dateEnd: '31 mei 2024',
      dateEndFormatted: '',
      location: 'Amstel 1 1017AB Amsterdam',
      decision: 'Ingetrokken',
      identifier: 'Z/001/000040',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2021-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-4',
          status: 'Ingetrokken',
          datePublished: '',
          description: 'Wij hebben uw Vergunning vakantieverhuur ingetrokken.',
          isActive: true,
          isChecked: true,
        },
      ],
      fetchDocumentsUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-001-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      processed: true,
      status: 'Ingetrokken',
      displayStatus: 'Ingetrokken',
    },
    {
      id: 'Z-000-000040',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      key: '1234',
      dateDecision: null,
      dateRequest: '10 mei 2021',
      dateRequestFormatted: '10 mei 2021',
      dateStart: '01 juni 2019',
      dateStartFormatted: '',
      dateEnd: '31 mei 2020',
      dateEndFormatted: '',
      location: 'Amstel 1 1017AB Amsterdam',
      decision: 'Verleend',
      identifier: 'Z/000/000040',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2021-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-4',
          status: 'Verlopen',
          datePublished: '2020-05-31',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      fetchDocumentsUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-000-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      processed: true,
      status: 'Verlopen',
      displayStatus: 'Verlopen',
    },
  ],
  bbVergunningen: [
    {
      dateDecision: '2023-03-22',
      dateRequest: '2023-02-13',
      dateRequestFormatted: '13 februari 2023',
      dateStart: '2023-03-22',
      dateStartFormatted: '22 maart 2023',
      dateEnd: '2028-07-01',
      dateEndFormatted: '01 juli 2028',
      decision: 'Verleend',
      heeftOvergangsRecht: true,
      id: 'Z-23-2130506',
      identifier: 'Z/23/2130506',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z-23-2130506',
        title: 'Vergunning bed & breakfast',
      },
      location: 'Amstel 3 Amsterdam',
      title: 'Vergunning bed & breakfast',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Verleend',
      displayStatus: 'Verleend',
      processed: true,
      documents: [],
    },
    {
      dateDecision: '',
      dateRequest: '25 oktober 2023',
      dateRequestFormatted: '25 oktober 2023',
      dateStart: '',
      dateStartFormatted: '',
      dateEnd: '',
      dateEndFormatted: '',
      decision: null,
      heeftOvergangsRecht: false,
      id: 'Z2023-WK000236',
      identifier: 'Z2023-WK000236',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z2023-WK000236',
        title: 'Vergunning bed & breakfast',
      },
      location: 'Amstel 2 Amsterdam',
      title: 'Vergunning bed & breakfast',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Afgehandeld',
      displayStatus: 'Afgehandeld',
      processed: true,
      documents: [],
    },
    {
      dateDecision: '',
      dateRequest: '20 november 2023',
      dateRequestFormatted: '20 november 2023',
      dateStart: '',
      dateStartFormatted: '',
      dateEnd: '',
      dateEndFormatted: '',
      decision: null,
      heeftOvergangsRecht: false,
      id: 'Z2023-WK000284',
      identifier: 'Z2023-WK000284',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z2023-WK000284',
        title: 'Vergunning bed & breakfast',
      },
      location: 'Amstel 1 Amsterdam',
      title: 'Vergunning bed & breakfast',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Afgehandeld',
      displayStatus: 'Zie besluit',
      processed: true,
      documents: [],
    },
  ],
};

const getTestState = (): AppState =>
  jsonCopy({
    TOERISTISCHE_VERHUUR: {
      content: verhuurContent,
      status: 'OK',
    },
  });

const testStateBase = getTestState();

function initializeState(snapshot: MutableSnapshot, state: AppState) {
  snapshot.set(appStateAtom, state);
}

describe('<ToeristscheVerhuurThema />', () => {
  const routeEntry = generatePath(AppRoutes.TOERISTISCHE_VERHUUR);
  const routePath = AppRoutes.TOERISTISCHE_VERHUUR;

  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristscheVerhuurThema}
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

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component state={testStateBase} />);
    expect(asFragment()).toMatchSnapshot();
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
    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(5);
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(3);

    expect(
      screen.getByText(
        /Het is niet toegestaan om op hetzelfde adres zowel aan vakantieverhuur als bed & breakfast te doen\./i
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
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(3);
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

    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(5);
    expect(
      screen.queryByText('Vergunning bed & breakfast')
    ).not.toBeInTheDocument();
  });
});
