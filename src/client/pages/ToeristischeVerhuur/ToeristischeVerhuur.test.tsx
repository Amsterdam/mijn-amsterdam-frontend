import ToeristischeVerhuur from './ToeristischeVerhuur';

import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import toeristischeVerhuurItems from '../../../server/mock-data/json/toeristische-verhuur.json';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const testState: any = {
  TOERISTISCHE_VERHUUR: toeristischeVerhuurItems,
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<ToeristischeVerhuur />', () => {
  const routeEntry = generatePath(AppRoutes.TOERISTISCHE_VERHUUR);
  const routePath = AppRoutes.TOERISTISCHE_VERHUUR;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ToeristischeVerhuur}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Toeristische verhuur')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Meer informatie over regels voor Particuliere vakantieverhuur'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Landelijk registratienummer toeristische verhuur')
        .length
    ).toBe(2);
    expect(screen.queryAllByText('Adres verhuurde woning').length).toBe(2);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();
  });
});
