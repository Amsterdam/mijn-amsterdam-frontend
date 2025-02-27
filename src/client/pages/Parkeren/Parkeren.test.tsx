import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { ThemaTitles } from '../../config/thema';
import MockApp from '../MockApp';
import { Parkeren } from './Parkeren';
import { forTesting } from './Parkeren';
import { appStateAtom } from '../../hooks/useAppState';

const linkButtonTxt = 'Ga naar Mijn Parkeren';
const EXTERNAL_PARKEREN_URL = 'https://parkeervergunningen.amsterdam.nl/';

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

const testState = {
  PARKEREN: {
    content: {
      url: EXTERNAL_PARKEREN_URL,
      isKnown: true,
      vergunningen: [
        {
          caseType: 'GPP',
          dateDecision: null,
          dateDecisionFormatted: null,
          dateEnd: null,
          dateInBehandeling: null,
          dateInBehandelingFormatted: null,
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
          dateInBehandeling: null,
          dateInBehandelingFormatted: null,
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

describe('Parkeren', () => {
  const routeEntry = generatePath(AppRoutes.PARKEREN);
  const routePath = AppRoutes.PARKEREN;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Parkeren}
        initializeState={initializeState}
      />
    );
  }

  beforeAll(() => {
    window.scrollTo = vi.fn();
  });

  it('should render the component and show the correct title', () => {
    render(<Component />);

    expect(screen.getAllByText(ThemaTitles.PARKEREN)[0]).toBeInTheDocument();
  });

  it('should contain the correct links', () => {
    render(<Component />);

    expect(
      screen.getByText('Meer over parkeervergunningen')
    ).toBeInTheDocument();

    expect(screen.getByText(linkButtonTxt)).toBeInTheDocument();
  });

  it('should display the list of parkeervergunningen', async () => {
    const screen = render(<Component />);

    expect(screen.getByText('Vergunning 1')).toBeInTheDocument();
    expect(screen.getByText('Vergunning 2')).toBeInTheDocument();
  });
});

describe('determinePageContentTop', () => {
  function determinePageContentTop(
    hasMijnParkerenVergunningen: boolean,
    parkerenUrlSSO: string
  ) {
    function Component() {
      return forTesting.determinePageContentTop(
        hasMijnParkerenVergunningen,
        parkerenUrlSSO
      );
    }
    return Component;
  }

  test('Renders button with parkeer vergunningen', () => {
    const PageContentTop = determinePageContentTop(true, EXTERNAL_PARKEREN_URL);
    const screen = render(
      <MockApp
        routeEntry="/"
        routePath="/"
        component={PageContentTop}
        initializeState={initializeState}
      />
    );
    expect(screen.queryByText(linkButtonTxt)).toBeInTheDocument();
  });

  test('Does not render link when only vergunningen from another source then parkeren are present', () => {
    const PageContentTop = determinePageContentTop(
      false,
      EXTERNAL_PARKEREN_URL
    );
    const screen = render(<PageContentTop />);
    expect(screen.queryByText(linkButtonTxt)).not.toBeInTheDocument();
  });
});
