import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { routeConfig } from './Parkeren-thema-config';
import { ParkerenDetail } from './ParkerenDetail';
import { ParkeerVergunningFrontend } from '../../../../server/services/parkeren/config-and-types';
import { AppState } from '../../../../universal/types/App.types';
import { componentCreator } from '../../MockApp';

const ID = 'Z-24-2233516';
const ID_WITH_SLASHES = 'Z/24/2233516';

const GPPbaseVergunning: ParkeerVergunningFrontend = {
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
  id: ID,
  key: 'D8DEC5AD3C6F456D954C53DEF791EAA3',
  link: {
    to: `/vergunningen/gpp/${ID}`,
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
  location: null,
  processed: false,
  title: 'Vergunning 1',
  isVerleend: true,
  identifier: ID_WITH_SLASHES,
  kentekens: 'KO123',
  kentekenNieuw: 'KN123',
  steps: [],
  displayStatus: 'Verleend',
};

function createParkerenState(opts: {
  vergunningen: ParkeerVergunningFrontend[];
}): AppState {
  const parkerenState: AppState['PARKEREN'] = {
    status: 'OK',
    content: {
      url: 'https://parkeervergunningen.amsterdam.nl/',
      isKnown: true,
      vergunningen: opts.vergunningen,
    },
  };

  const appState = {
    PARKEREN: parkerenState,
  } as unknown as AppState;

  return appState;
}

describe('Kenteken tests', () => {
  const createParkerenDetail = componentCreator({
    component: ParkerenDetail,
    routeEntry: generatePath(routeConfig.detailPage.path, {
      caseType: 'GPP',
      id: ID,
    }),
    routePath: routeConfig.detailPage.path,
  });

  const nieuwKentekenLabelName = 'Nieuw kenteken';

  test('Both old and new kentekens are visible', () => {
    const vergunningen: ParkeerVergunningFrontend[] = [
      {
        ...GPPbaseVergunning,
        kentekens: 'KO123',
        kentekenNieuw: 'KN123',
      },
    ];
    const state = createParkerenState({ vergunningen });
    const ParkerenDetailComponent = createParkerenDetail(state);

    const screen = render(<ParkerenDetailComponent />);
    screen.getByText('KO123');

    screen.getByText(nieuwKentekenLabelName);
    screen.getByText('KN123');
  });

  test('kentekenNieuw label is not visible when no kentekenNieuw present', () => {
    const vergunningen: ParkeerVergunningFrontend[] = [
      {
        ...GPPbaseVergunning,
        kentekens: 'KO123',
        kentekenNieuw: null,
      },
    ];
    const state = createParkerenState({ vergunningen });
    const ParkerenDetailComponent = createParkerenDetail(state);

    const screen = render(<ParkerenDetailComponent />);
    expect(screen.queryByText(nieuwKentekenLabelName)).toBeNull();
  });
});
