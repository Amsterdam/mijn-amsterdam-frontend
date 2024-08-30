import { render, waitFor } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import AfisBetaalVoorkeuren from './AfisBetaalVoorkeuren';
import { bffApi } from '../../../test-utils';

const testState: any = {
  AFIS: {
    status: 'OK',
    content: {
      isKnown: true,
      businessPartnerIdEncrypted: '1',
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<AfisBetaalVoorkeuren />', () => {
  beforeEach(() => {
    bffApi.get('/services/afis/businesspartner/1').reply(200, {
      content: {
        businessPartnerIdEncrypted: '1',
      },
      status: 'OK',
    });
  });

  const routeEntry = generatePath(AppRoutes.AFIS_BETAALVOORKEUREN);
  const routePath = AppRoutes.AFIS_BETAALVOORKEUREN;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AfisBetaalVoorkeuren}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', async () => {
    const { asFragment } = render(<Component />);

    const screen = render(<Component />);

    await waitFor(() => {
      expect(screen.getByText('Taxon Expeditions BV')).toBeInTheDocument();
    });

    expect(screen.asFragment()).toMatchSnapshot();
  });
});
