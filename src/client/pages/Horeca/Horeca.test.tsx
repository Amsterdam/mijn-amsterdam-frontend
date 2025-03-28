import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import Horeca from './Horeca';
import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import { horecaOptions } from '../../../server/services/horeca';
import {
  addLinks,
  transformVergunningenData,
  VergunningenDecos,
} from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';

const testState: any = {
  HORECA: {
    status: 'OK',
    content: addLinks(
      transformVergunningenData(vergunningenData as VergunningenDecos).filter(
        horecaOptions.filter
      ),
      AppRoutes['HORECA/DETAIL']
    ),
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Horeca />', () => {
  const routeEntry = generatePath(AppRoutes.HORECA);
  const routePath = AppRoutes.HORECA;
  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Horeca}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
