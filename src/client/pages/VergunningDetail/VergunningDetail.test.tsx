import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import VergunningDetail from './VergunningDetail';

const content = transformVergunningenData(vergunningenData as any);

const testState = {
  VERGUNNINGEN: {
    status: 'OK',
    content,
  },
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

describe('<VergunningDetail />', () => {
  (window as any).scrollTo = jest.fn();
  const vergunning = content.find((v) => v.caseType === 'Evenement melding');
  const routeEntry = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    title: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id,
  });
  const routePath = AppRoutes['VERGUNNINGEN/DETAIL'];

  let Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={VergunningDetail}
      initializeState={state(testState)}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
