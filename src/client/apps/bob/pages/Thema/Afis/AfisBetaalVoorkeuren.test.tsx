import { render, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';

import { themaConfig } from './Afis-thema-config.ts';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren.tsx';
import type { AfisBusinessPartnerDetailsTransformed } from '../../../../../../server/services/afis/afis-types.ts';
import { bffApi } from '../../../../../../testing/utils.ts';
import type { AppState } from '../../../../../../universal/types/App.types.ts';
import { MockApp } from '../../MockApp.tsx';

const businessPartnerIdEncrypted = 'xxx-123-xxx';

const testState = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerIdEncrypted,
    },
  },
  BELASTINGEN: {
    status: 'OK',
    content: {
      isKnown: true,
      url: 'https://belastingbalie.amsterdam.nl',
    },
  },
} as AppState;

describe('<AfisBetaalVoorkeuren />', () => {
  const businessPartnerDetails: AfisBusinessPartnerDetailsTransformed = {
    businessPartnerId: '515177',
    fullName: 'Taxon Expeditions BV',
    phone: null,
    email: 'someone@example.org',
  };

  beforeEach(() => {
    bffApi
      .get(`/services/afis/businesspartner?id=${businessPartnerIdEncrypted}`)
      .times(2)
      .reply(200, {
        content: businessPartnerDetails,
        status: 'OK',
      });

    bffApi
      .get(`/services/afis/e-mandates?id=${businessPartnerIdEncrypted}`)
      .times(2)
      .reply(200, {
        content: [],
        status: 'OK',
      });

    bffApi
      .get(`/services/afis/facturen/overzicht?id=${businessPartnerIdEncrypted}`)
      .reply(200, {
        content: {
          open: { facturen: [], count: 0 },
          afgehandeld: { facturen: [], count: 0 },
          overgedragen: { facturen: [], count: 0 },
        },
        status: 'OK',
      });
  });

  const routePath = themaConfig.detailPageBetaalvoorkeuren.route.path;
  const routeEntry = generatePath(routePath);

  function Component({ state = testState }: { state?: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AfisBetaalVoorkeuren}
        state={state}
      />
    );
  }

  test('Display business partner details', async () => {
    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('someone@example.org')).toBeInTheDocument();
      expect(screen.getByText('Taxon Expeditions BV')).toBeInTheDocument();
    });
  });

  test('Shows multiple vestigingen disclaimer when enabled', async () => {
    const stateWithMultipleVestigingen = {
      ...testState,
      AFIS: {
        ...testState.AFIS,
        content: {
          ...testState.AFIS.content,
          showMultipleVestigingenDisclaimer: true,
        },
      },
    } as AppState;

    const screen = render(<Component state={stateWithMultipleVestigingen} />);

    await waitFor(() => {
      expect(
        screen.getByText('Inzage in uw facturen van de gemeente Amsterdam')
      ).toBeInTheDocument();
    });
  });

  test('Does not show multiple vestigingen disclaimer by default', async () => {
    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('Taxon Expeditions BV')).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Inzage in uw facturen van de gemeente Amsterdam')
    ).not.toBeInTheDocument();
  });
});
