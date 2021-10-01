import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import FinancieleHulpData from '../../../server/mock-data/json/financiele-hulp.json';
import { FinancieleHulp as FinancieleHulpContent } from '../../../server/services/financiele-hulp';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import FinancieleHulp from './FinancieleHulp';
import MockApp from '../MockApp';

interface TestState {
  FINANCIELE_HULP: {
    status: string;
    content: FinancieleHulpContent;
  };
}

const testState: TestState = {
  FINANCIELE_HULP: {
    status: 'OK',
    content: FinancieleHulpData.content as FinancieleHulpContent,
  },
};

function initializeState(snapshot: MutableSnapshot, state: TestState) {
  snapshot.set(appStateAtom as any, state);
}

describe('<FinancieleHulp />', () => {
  const routeEntry = generatePath(AppRoutes.FINANCIELE_HULP);
  const routePath = AppRoutes.FINANCIELE_HULP;
  const Component = ({ state }: { state: TestState }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={FinancieleHulp}
      initializeState={(snap) => initializeState(snap, state)}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component state={testState} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows the page succesfully', () => {
    render(<Component state={testState} />);
    expect(screen.getByText('Financiële Hulp')).toBeInTheDocument();
    expect(
      screen.getByText('Meer informatie over de Kredietbank')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Afkoopvoorstellen zijn verstuurd')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Kredietsom €1.689,12 met openstaand termijnbedrag €79,66'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Beheer uw budget op FiBu')).toBeInTheDocument();
  });
});
