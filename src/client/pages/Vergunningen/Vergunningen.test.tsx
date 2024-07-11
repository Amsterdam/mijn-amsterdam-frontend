import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import {
  addLinks,
  horecaVergunningTypes,
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
  VergunningenSourceData,
} from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Vergunningen from './Vergunningen';

const testState: any = {
  VERGUNNINGEN: {
    status: 'OK',
    content: addLinks(
      transformVergunningenData(
        vergunningenData as VergunningenSourceData
      ).filter(
        (vergunning) =>
          ![
            ...toeristischeVerhuurVergunningTypes,
            ...horecaVergunningTypes,
          ].includes(vergunning.caseType)
      ),
      AppRoutes['VERGUNNINGEN/DETAIL']
    ),
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Vergunningen />', () => {
  const routeEntry = generatePath(AppRoutes.VERGUNNINGEN);
  const routePath = AppRoutes.VERGUNNINGEN;
  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Vergunningen}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
