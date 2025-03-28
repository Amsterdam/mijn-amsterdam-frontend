import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { KrefiaThemaPagina } from './Krefia';
import KrefiaData from '../../../../mocks/fixtures/krefia.json';
import {
  forTesting,
  KrefiaSourceResponse,
} from '../../../server/services/krefia';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const testState = {
  KREFIA: {
    content: forTesting.transformKrefiaResponse(
      KrefiaData as KrefiaSourceResponse
    ),
    status: 'OK',
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot, state: AppState) {
  snapshot.set(appStateAtom, state);
}

describe('<Krefia />', () => {
  const routeEntry = generatePath(AppRoutes.KREFIA);
  const routePath = AppRoutes.KREFIA;
  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={KrefiaThemaPagina}
        initializeState={(snap) => initializeState(snap, state)}
      />
    );
  }

  it('Shows the page succesfully', () => {
    render(<Component state={testState} />);
    expect(screen.getByText('Kredietbank & FIBU')).toBeInTheDocument();
    expect(
      screen.getByText('Meer informatie over Kredietbank Amsterdam')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Afkoopvoorstellen zijn verstuurd')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Kredietsom €1.689,12 met openstaand termijnbedrag €79,66'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Lopend')).toBeInTheDocument();
  });
});
