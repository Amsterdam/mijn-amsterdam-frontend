import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Erfpacht from './Erfpacht';
import ERFPACHTv2_DOSSIERINFO_DETAILS from '../../../server/mock-data/json/erfpacht-v2-dossiers.json';
import ERFPACHTv2_DOSSIERS from '../../../server/mock-data/json/erfpacht-v2-dossiers.json';
import ERFPACHTv2_ERFPACHTER from '../../../server/mock-data/json/erfpacht-v2-erfpachter.json';

const testState: any = {
  ERFPACHTv2: { status: 'OK', content: null },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Erfpacht />', () => {
  const routeEntry = generatePath(AppRoutes.ERFPACHTv2);
  const routePath = AppRoutes.ERFPACHTv2;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Erfpacht}
      initializeState={initializeState}
    />
  );

  test('Renders without crashing', () => {
    render(<Component />);
  });
});
