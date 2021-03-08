import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Sia from './Sia';

const testState: any = {
  SIA: {
    content: [],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Sia />', () => {
  const routeEntry = generatePath(AppRoutes.SIA);
  const routePath = AppRoutes.SIA;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Sia}
      initializeState={initializeState}
    />
  );
  it('Renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Meldingen')).toBeInTheDocument();
    // expect(screen.getByText('Sia body')).toBeInTheDocument();
  });
});
