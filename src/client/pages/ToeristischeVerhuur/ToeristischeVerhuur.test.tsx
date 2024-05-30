import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import { AppRoutes } from '../../../universal/config';
import { CaseType } from '../../../universal/types/vergunningen';
import { AppState } from '../../AppState';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischeVerhuur from './ToeristischeVerhuur';
import { jsonCopy } from '../../../universal/helpers';

type VerhuurState = Pick<AppState, 'TOERISTISCHE_VERHUUR'>;

const verhuurContent: VerhuurState['TOERISTISCHE_VERHUUR']['content'] = {
  lvvRegistraties: [
    {
      street: 'Amstel',
      houseNumber: '1',
      houseLetter: null,
      houseNumberExtension: null,
      postalCode: '1012PN',
      city: 'Amsterdam',
      registrationNumber: 'E7B8 B042 8A92 37E5 0363',
      agreementDate: '2021-01-01T10:47:44.6107122',
    },
    {
      street: 'Amstel',
      houseNumber: '1',
      houseLetter: null,
      houseNumberExtension: null,
      postalCode: '1012PN',
      city: 'Amsterdam',
      registrationNumber: 'BBBBBBBBBBBBBBBBBBBB',
      agreementDate: '2021-01-01T10:47:44.6107122',
    },
  ],
  vakantieverhuurVergunningen: [
    {
      id: 'Z-XXX-000007C',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2022',
      datumVan: '01 augustus 2022',
      datumTot: '22 augustus 2023',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Verleend',
      zaaknummer: 'Z/XXX/000007c',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '2022-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'In behandeling',
          datePublished: '2022-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '2022-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Gewijzigd',
          datePublished: '2023-08-22',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007C',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: false,
      status: 'Afgehandeld',
    },
    {
      id: 'Z-XXX-000007B',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2023',
      datumVan: '01 augustus 2023',
      datumTot: '30 september 2024',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Verleend',
      zaaknummer: 'Z/XXX/000007b',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '2023-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'In behandeling',
          datePublished: '2023-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '2023-05-10',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007B',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: true,
      status: 'Afgehandeld',
    },
    {
      id: 'Z-XXX-000007',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2020',
      datumVan: '01 augustus 2020',
      datumTot: '30 september 2021',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Verleend',
      zaaknummer: 'Z/XXX/000007',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '2020-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'In behandeling',
          datePublished: '2020-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '2020-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Gewijzigd',
          datePublished: '2021-09-30',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: false,
      status: 'Afgehandeld',
    },
    {
      id: 'Z-001-000040',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2021',
      datumVan: '01 juni 2020',
      datumTot: '31 mei 2024',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Ingetrokken',
      zaaknummer: 'Z/001/000040',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'In behandeling',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '2021-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Gewijzigd',
          datePublished: '',
          description: 'Wij hebben uw Vergunning vakantieverhuur ingetrokken.',
          isActive: true,
          isChecked: true,
        },
      ],
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-001-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: false,
      status: 'Ingetrokken',
    },
    {
      id: 'Z-000-000040',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2021',
      datumVan: '01 juni 2019',
      datumTot: '31 mei 2020',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Verleend',
      zaaknummer: 'Z/000/000040',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'In behandeling',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '2021-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Gewijzigd',
          datePublished: '2020-05-31',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-000-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: false,
      status: 'Afgehandeld',
    },
  ],
  bbVergunningen: [
    {
      datumAfhandeling: '22 maart 2023',
      datumAanvraag: '13 februari 2023',
      datumVan: '22 maart 2023',
      datumTot: '01 juli 2028',
      resultaat: 'Verleend',
      heeftOvergangsRecht: true,
      id: 'Z-23-2130506',
      zaakId: '-999741',
      zaaknummer: 'Z/23/2130506',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z-23-2130506',
        title: 'Vergunning bed & breakfast',
      },
      adres: 'Amstel 3 Amsterdam',
      eigenaar: '',
      aanvrager: '',
      titel: 'Vergunning bed & breakfast',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Afgehandeld',
      isActief: true,
      documents: [],
    },
    {
      datumAfhandeling: '',
      datumAanvraag: '25 oktober 2023',
      datumVan: '',
      datumTot: '',
      resultaat: null,
      heeftOvergangsRecht: false,
      id: 'Z2023-WK000236',
      zaakId: '126085265',
      zaaknummer: 'Z2023-WK000236',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z2023-WK000236',
        title: 'Vergunning bed & breakfast',
      },
      adres: 'Amstel 2 Amsterdam',
      eigenaar: '',
      aanvrager: '',
      titel: 'Vergunning bed & breakfast',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Ontvangen',
      isActief: true,
      documents: [],
    },
    {
      datumAfhandeling: '',
      datumAanvraag: '20 november 2023',
      datumVan: '',
      datumTot: '',
      resultaat: null,
      heeftOvergangsRecht: false,
      id: 'Z2023-WK000284',
      zaakId: '126085711',
      zaaknummer: 'Z2023-WK000284',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z2023-WK000284',
        title: 'Vergunning bed & breakfast',
      },
      adres: 'Amstel 1 Amsterdam',
      eigenaar: '',
      aanvrager: '',
      titel: 'Vergunning bed & breakfast',
      statussen: [
        {
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      status: 'Ontvangen',
      isActief: true,
      documents: [],
    },
  ],
};

const getTestState = (): VerhuurState =>
  jsonCopy({
    TOERISTISCHE_VERHUUR: {
      content: verhuurContent,
      status: 'OK',
    },
  });

const testStateBase = getTestState();

function initializeState(snapshot: MutableSnapshot, state: VerhuurState) {
  snapshot.set(appStateAtom as any, state);
}

describe('<ToeristischeVerhuur />', () => {
  const routeEntry = generatePath(AppRoutes.TOERISTISCHE_VERHUUR);
  const routePath = AppRoutes.TOERISTISCHE_VERHUUR;

  const Component = ({ state }: { state: VerhuurState }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ToeristischeVerhuur}
      initializeState={(snap) => initializeState(snap, state)}
    />
  );

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-09-22').getTime());
  });

  afterAll(() => {
    vi.useRealTimers();
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
      screen.queryAllByText('Registratienummer toeristische verhuur').length
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
    const testState2: VerhuurState = getTestState();

    testState2.TOERISTISCHE_VERHUUR.content!.lvvRegistraties = [];

    const screen = render(<Component state={testState2} />);

    expect(
      screen.getByText(
        /U moet daarom ook een landelijk registratienummer voor toeristische verhuur aanvragen./
      )
    ).toBeInTheDocument();
  });

  it('Shows B&B page', () => {
    const testState3: VerhuurState = getTestState();

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
    const testState4: VerhuurState = getTestState();

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
