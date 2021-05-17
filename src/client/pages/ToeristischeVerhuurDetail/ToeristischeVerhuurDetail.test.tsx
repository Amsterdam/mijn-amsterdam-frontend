import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischVerhuurDetail from './ToeristischeVerhuurDetail';

const vergunningen = transformVergunningenData(vergunningenData as any);

const testState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: vergunningen,
  },
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

describe('<ToeristischVerhuurDetail />', () => {
  (window as any).scrollTo = jest.fn();
  const vergunning = vergunningen.find((v) => v.caseType === 'Vakantieverhuur');
  const routeEntry = generatePath(AppRoutes['TOERISTISCHE_VERHUUR/DETAIL'], {
    id: vergunning?.id,
  });
  const routePath = AppRoutes['TOERISTISCHE_VERHUUR/DETAIL'];

  let Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ToeristischVerhuurDetail}
      initializeState={state(testState)}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
