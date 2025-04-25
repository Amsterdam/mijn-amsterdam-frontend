import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { routeConfig } from './Parkeren-thema-config';
import { ParkerenList } from './ParkerenList';
import { AppState } from '../../../../universal/types/App.types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';
import { listPageParamKind } from '../Vergunningen/Vergunningen-thema-config';

const testState = {
  PARKEREN: {
    content: {
      url: 'https://parkeervergunningen.amsterdam.nl/',
      isKnown: true,
      vergunningen: [
        {
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
          identifier: 'Z/24/2233516',
          key: 'D8DEC5AD3C6F456D954C53DEF791EAA3',
          link: {
            to: '/vergunningen/gpp/Z-24-2233516',
            title: 'Bekijk hoe het met uw aanvraag staat',
          },
          location: null,
          processed: false,
          status: 'open',
          title: 'Vergunning 1',
        },
        {
          caseType: 'GPK',
          dateDecision: null,
          dateDecisionFormatted: null,
          dateEnd: null,
          dateRequest: '2024-06-05T00:00:00',
          dateRequestFormatted: '05 juni 2024',
          dateStart: null,
          decision: null,
          fetchDocumentsUrl:
            'http://localhost:5000/api/v1/services/vergunningen/v2/962cCLy-d6nz4-85Cfyb2CaOKclPxVWCXF9L8T1lYamfgI25euHU1vf5OsA-qeyGYVuukIOquMqEFhww68MWxEW5LjLvu6jwplz4Hgs1LyE',
          id: 'Z-24-2233517',
          identifier: 'Z/24/2233516',
          key: 'D8DEC5AD3C6F456D954C53DEF791EAA3',
          link: {
            to: '/vergunningen/gpp/Z-24-2233516',
            title: 'Bekijk hoe het met uw aanvraag staat',
          },
          location: null,
          processed: false,
          status: 'open',
          title: 'Vergunning 2',
        },
      ],
    },
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('ParkerenList', () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
  });

  const routeEntry = generatePath(routeConfig.listPage.path, {
    kind: listPageParamKind.inProgress,
    page: null,
  });

  const routePath = routeConfig.listPage.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ParkerenList}
        initializeState={initializeState}
      />
    );
  }

  it('should render the component and show the correct title', () => {
    render(<Component />);
    expect(
      screen.getByRole('heading', { name: 'Lopende aanvragen' })
    ).toBeInTheDocument();
  });

  it('should display the list of parkeervergunningen', async () => {
    render(<Component />);
    expect(screen.getByText('Vergunning 1')).toBeInTheDocument();
    expect(screen.getByText('Vergunning 2')).toBeInTheDocument();
  });
});
