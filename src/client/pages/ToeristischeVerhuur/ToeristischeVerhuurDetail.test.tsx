import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { describe, expect } from 'vitest';
import { bffApi } from '../../../test-utils';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischVerhuurDetail from './ToeristischeVerhuurDetail';

const vakantieverhuurVergunningen = [
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
];

const bbVergunningen = [
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
    documents: [
      {
        id: 'xiup_IrPSXXuB6bI5sNz6Zrwl5UbqsqYoeEQXwGLrvA',
        title: 'Documentje.pdf  ',
        url: 'http://localhost:5000/api/v1/services/toeristische-verhuur/bb/document/xiup_IrPSXXuB6bI5sNz6Zrwl5UbqsqYoeEQXwGLrvA',
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
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

describe('<ToeristischVerhuurDetail />', () => {
  bffApi.get(/\/relay\/decosjoin\/listdocuments\/(.*)/).reply(200, {
    content: [],
  });

  test('Vakantieverhuur vergunning <VergunningVerhuur/>', () => {
    const vergunning = vakantieverhuurVergunningen[0];
    const routeEntry = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: vergunning.id,
      }
    );
    const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'];
    let Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristischVerhuurDetail}
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

  test('Bed & Breakfast vergunning <VergunningVerhuur/>', () => {
    const vergunning = bbVergunningen[0];
    const routeEntry = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        id: vergunning.id,
      }
    );
    const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'];
    let Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ToeristischVerhuurDetail}
        initializeState={state(testState)}
      />
    );
    render(<Component />);
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
