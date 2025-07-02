import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { routeConfig } from './Parkeren-thema-config';
import { ParkerenDetail } from './ParkerenDetail';
import { AppState } from '../../../../universal/types/App.types';
import { componentCreator } from '../../MockApp';

const GPPvergunning = {
  caseType: 'GPP',
  dateDecision: null,
  dateDecisionFormatted: null,
  dateEnd: null,
  dateRequest: '2024-06-05T00:00:00',
  dateRequestFormatted: '05 juni 2024',
  dateStart: null,
  decision: null,
  fetchDocumentsUrl:
    'http://localhost:5000/api/v1/services/vergunningen/v2/962cCLy-d6nz4-85Cfyb2CaOKclPxVWCXF9L8T1lYamfgI25euHU1vf5OsA-qeyGYVuukIOquMqEFhww68MWxEW5LjLvu6jwplz4Hgs1LyE',
  id: 'Z-24-2233516',
  key: 'D8DEC5AD3C6F456D954C53DEF791EAA3',
  link: {
    to: '/vergunningen/gpp/Z-24-2233516',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
  location: null,
  processed: false,
  status: 'open',
  title: 'Vergunning 1',
};

const parkerenState: AppState['PARKEREN'] = {
  content: {
    url: 'https://parkeervergunningen.amsterdam.nl/',
    isKnown: true,
    vergunningen: [
      {
        ...GPPvergunning,
        identifier: 'Z/24/2233516',
        kentekens: 'KO123',
        kentekenNieuw: 'KN123',
      },
    ],
  },
};

const appState = {
  PARKEREN: parkerenState,
} as unknown as AppState;

const createParkerenDetail = componentCreator({
  component: ParkerenDetail,
  routeEntry: generatePath(routeConfig.detailPage.path, {
    caseType: 'GPP',
    id: 'Z-24-2233516',
  }),
  routePath: routeConfig.detailPage.path,
});

const ParkerenDetailComponent = createParkerenDetail(appState);

const nieuwKentekenLabelName = 'Nieuw kenteken';

test('Both old and new kentekens are visible', () => {
  const screen = render(<ParkerenDetailComponent />);
  screen.getByText('KO123');

  screen.getByText(nieuwKentekenLabelName);
  screen.getByText('KN123');
});

test('kentekenNieuw label is not visible when no kentekenNieuw present', () => {
  const parkerenState: AppState['PARKEREN'] = {
    content: {
      url: 'https://parkeervergunningen.amsterdam.nl/',
      isKnown: true,
      vergunningen: [
        {
          ...GPPvergunning,
          identifier: 'Z/24/2233516',
          kentekens: 'KO123',
        },
      ],
    },
  };
  const appState = {
    PARKEREN: parkerenState,
  } as unknown as AppState;
  const ParkerenDetailComponent = createParkerenDetail(appState);

  const screen = render(<ParkerenDetailComponent />);
  expect(screen.queryByText(nieuwKentekenLabelName)).toBeNull();
});
