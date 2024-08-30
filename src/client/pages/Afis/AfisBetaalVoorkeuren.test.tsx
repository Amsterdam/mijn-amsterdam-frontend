import { render, waitFor } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AfisBusinessPartnerDetailsTransformed } from '../../../server/services/afis/afis-types';
import { bffApi } from '../../../test-utils';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { AfisBetaalVoorkeuren } from './AfisBetaalVoorkeuren';

const businessPartnerIdEncrypted = 'xxx-123-xxx';

const testState = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerIdEncrypted,
    },
  },
} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<AfisBetaalVoorkeuren />', () => {
  const routeEntry = generatePath(AppRoutes['AFIS/BETAALVOORKEUREN']);
  const routePath = AppRoutes['AFIS/BETAALVOORKEUREN'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AfisBetaalVoorkeuren}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', async () => {
    const businessPartnerDetails: AfisBusinessPartnerDetailsTransformed = {
      addressId: 999,
      businessPartnerId: 515177,
      fullName: 'Taxon Expeditions BV',
      phone: null,
      email: null,
    };

    bffApi
      .get(`/services/afis/businesspartner/${businessPartnerIdEncrypted}`)
      .reply(200, {
        content: businessPartnerDetails,
        status: 'OK',
      });

    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('Taxon Expeditions BV')).toBeInTheDocument();
    });

    expect(screen.asFragment()).toMatchSnapshot();
  });
});
