import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import SiaDetail from './SiaDetail';

const SIA_ITEM_ID = '';
const testState: any = {
  SIA: {
    content: [],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<SiaDetail />', () => {
  const routeEntry = generatePath(AppRoutes.SIA, {
    id: SIA_ITEM_ID,
  });
  const routePath = AppRoutes.SIA;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={SiaDetail}
      initializeState={initializeState}
    />
  );
  it('Renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Meldingen')).toBeInTheDocument();
    // expect(screen.getByText('SiaDetail body')).toBeInTheDocument();
  });
});
