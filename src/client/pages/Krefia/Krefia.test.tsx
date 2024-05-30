import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import KrefiaData from 'mocks/fixtures/krefia.json';
import { Krefia as KrefiaContent } from '../../../server/services/krefia';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import Krefia from './Krefia';
import MockApp from '../MockApp';

interface TestState {
  KREFIA: {
    status: string;
    content: KrefiaContent;
  };
}

const testState: TestState = {
  KREFIA: {
    status: 'OK',
    content: KrefiaData.content as KrefiaContent,
  },
};

function initializeState(snapshot: MutableSnapshot, state: TestState) {
  snapshot.set(appStateAtom as any, state);
}

describe('<Krefia />', () => {
  const routeEntry = generatePath(AppRoutes.KREFIA);
  const routePath = AppRoutes.KREFIA;
  const Component = ({ state }: { state: TestState }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Krefia}
      initializeState={(snap) => initializeState(snap, state)}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component state={testState} />);
    expect(asFragment()).toMatchSnapshot();
  });

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
