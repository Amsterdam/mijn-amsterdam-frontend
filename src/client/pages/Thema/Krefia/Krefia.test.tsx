import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';

import { routeConfig } from './Krefia-thema-config';
import { KrefiaThema } from './KrefiaThema';
import KrefiaData from '../../../../../mocks/fixtures/krefia.json';
import { forTesting } from '../../../../server/services/krefia/krefia';
import type { KrefiaSourceResponse } from '../../../../server/services/krefia/krefia.types';
import { AppState } from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';

const testState = {
  KREFIA: {
    content: forTesting.transformKrefiaResponse(
      KrefiaData as KrefiaSourceResponse
    ),
    status: 'OK',
  },
} as unknown as AppState;

describe('<Krefia />', () => {
  const routeEntry = generatePath(routeConfig.themaPage.path);
  const routePath = routeConfig.themaPage.path;

  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={KrefiaThema}
        state={state}
      />
    );
  }

  it('Shows the page succesfully', () => {
    render(<Component state={testState} />);
    expect(
      screen.getByRole('heading', {
        name: 'Kredietbank & FIBU',
      })
    ).toBeInTheDocument();
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
