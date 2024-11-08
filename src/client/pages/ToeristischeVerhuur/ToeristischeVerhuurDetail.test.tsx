import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { describe, expect } from 'vitest';

import { BBVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning-types';
import { bffApi } from '../../../test-utils';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { ToeristischeVerhuurDetail } from './ToeristischeVerhuurDetail';
import { VakantieverhuurVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import { AppState } from '../../../universal/types';

const vakantieverhuurVergunningen: VakantieverhuurVergunning[] = [
  {
    id: 'Z-XXX-000007C',
    title: 'Vergunning vakantieverhuur',
    dateDecision: null,
    dateReceived: '2022-05-10',
    dateStart: '2022-08-01',
    dateStartFormatted: '01 augustus 2022',
    dateEnd: '2023-08-01',
    dateEndFormatted: '22 augustus 2023',
    adres: 'Amstel 1 1017AB Amsterdam',
    result: 'Verleend',
    zaaknummer: 'Z/XXX/000007c',
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
        status: 'Gewijzigd',
        datePublished: '2023-08-22',
        description: 'Uw Vergunning vakantieverhuur is verlopen.',
        isActive: true,
        isChecked: true,
      },
    ],
    fetchDocumentsUrl:
      'http://bff-api-host/api/v1/services/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
    link: {
      to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-XXX-000007C',
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
    isActual: false,
    status: 'Afgehandeld',
    documents: [],
  },
];

const bbVergunningen: BBVergunning[] = [
  {
    dateDecision: '2023-03-22',
    dateReceived: '2023-02-13',
    dateStart: '2023-03-22',
    dateStartFormatted: '22 maart 2023',
    dateEnd: '2028-07-01',
    dateEndFormatted: '01 juli 2028',
    result: 'Verleend',
    heeftOvergangsRecht: true,
    id: 'Z-23-2130506',
    zaaknummer: 'Z/23/2130506',
    link: {
      to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z-23-2130506',
      title: 'Vergunning bed & breakfast',
    },
    adres: 'Amstel 3 Amsterdam',
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
    isActual: true,
    documents: [
      {
        id: 'xiup_IrPSXXuB6bI5sNz6Zrwl5UbqsqYoeEQXwGLrvA',
        title: 'Documentje.pdf  ',
        url: 'http://bff-api-host/api/v1/services/toeristische-verhuur/bb/document/xiup_IrPSXXuB6bI5sNz6Zrwl5UbqsqYoeEQXwGLrvA',
        download: 'Documentje.pdf  ',
        external: true,
        datePublished: '',
      },
    ],
  },
];

const testState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: { vakantieverhuurVergunningen, bbVergunningen },
  },
} as AppState;

function state(state: AppState) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

describe('<ToeristischVerhuurDetail />', () => {
  test('Vakantieverhuur vergunning', () => {
    bffApi
      .get((uri: string) => decodeURI(uri).includes('decosjoin/listdocuments'))
      .reply(200, {
        content: [],
      });
    const vergunning = vakantieverhuurVergunningen[0];
    const routeEntry = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: vergunning.id,
        casetype: 'vakantieverhuur',
      }
    );
    const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'];
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristischeVerhuurDetail}
        initializeState={state(testState)}
      />
    );
    render(<Component />);
    expect(screen.getByText('Vergunning vakantieverhuur')).toBeInTheDocument();
    expect(screen.getByText('Z/XXX/000007c')).toBeInTheDocument();
    expect(screen.getByText('Vanaf')).toBeInTheDocument();
    expect(screen.getByText('Tot')).toBeInTheDocument();
    expect(screen.getByText('01 augustus 2022')).toBeInTheDocument();
    expect(screen.getAllByText('22 augustus 2023').length).toBe(2);
    expect(screen.getByText('Verleend')).toBeInTheDocument();
    expect(
      screen.getByText('Uw Vergunning vakantieverhuur is verlopen.')
    ).toBeInTheDocument();
  });

  test('Bed & Breakfast vergunning', () => {
    const vergunning = bbVergunningen[0];
    const routeEntry = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: vergunning.id,
        casetype: 'bed-and-breakfast',
      }
    );
    const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'];
    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristischeVerhuurDetail}
        initializeState={state(testState)}
      />
    );
    const screen = render(<Component />);
    expect(screen.getByText('Vergunning bed & breakfast')).toBeInTheDocument();
    expect(screen.getByText('Z/23/2130506')).toBeInTheDocument();
    expect(screen.getByText('Vanaf')).toBeInTheDocument();
    expect(screen.getByText('Tot')).toBeInTheDocument();
    expect(screen.getAllByText('22 maart 2023').length).toBe(2);
    expect(screen.getByText('01 juli 2028')).toBeInTheDocument();
    expect(screen.getByText('Verleend')).toBeInTheDocument();
    expect(
      screen.queryByText('Uw Vergunning vakantieverhuur is verlopen.')
    ).not.toBeInTheDocument();
  });
});
