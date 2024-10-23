import { render, screen, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { CaseType } from '../../../universal/types/vergunningen';
import { ThemaTitles } from '../../config/thema';
import MockApp from '../MockApp';
import Parkeren from './Parkeren';
import { appStateAtom } from '../../hooks/useAppState';

const testState = {
  PARKEREN: {
    content: {
      url: 'https://parkeervergunningen.amsterdam.nl/',
    },
  },
  VERGUNNINGENv2: {
    status: 'OK',
    content: [
      {
        caseType: CaseType.GPP,
        dateDecision: null,
        dateDecisionFormatted: null,
        dateEnd: null,
        dateInBehandeling: null,
        dateInBehandelingFormatted: null,
        dateRequest: '2024-06-05T00:00:00',
        dateRequestFormatted: '05 juni 2024',
        dateStart: null,
        decision: null,
        fetchUrl:
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
        caseType: CaseType.GPK,
        dateDecision: null,
        dateDecisionFormatted: null,
        dateEnd: null,
        dateInBehandeling: null,
        dateInBehandelingFormatted: null,
        dateRequest: '2024-06-05T00:00:00',
        dateRequestFormatted: '05 juni 2024',
        dateStart: null,
        decision: null,
        fetchUrl:
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
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('Parkeren', () => {
  beforeAll(() => {
    (window.scrollTo as any) = vi.fn();
  });

  const routeEntry = generatePath(AppRoutes.PARKEREN);
  const routePath = AppRoutes.PARKEREN;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Parkeren}
      initializeState={initializeState}
    />
  );

  it('should render the component and show the correct title', () => {
    render(<Component />);

    expect(screen.getAllByText(ThemaTitles.PARKEREN)[0]).toBeInTheDocument();
  });

  it('should contain the correct links', () => {
    render(<Component />);

    expect(
      screen.getByText('Meer over parkeervergunningen')
    ).toBeInTheDocument();

    expect(screen.getByText('Log in op Mijn Parkeren')).toBeInTheDocument();
  });

  it('should display the list of parkeervergunningen', async () => {
    const screen = render(<Component />);
    expect(screen.asFragment()).toMatchSnapshot();

    await waitFor(() => {
      expect(screen.getByText('Vergunning 1')).toBeInTheDocument();
      expect(screen.getByText('Vergunning 2')).toBeInTheDocument();
    });
  });
});
