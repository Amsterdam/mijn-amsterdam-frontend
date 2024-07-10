import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import {
  transformVergunningenData,
  VergunningenSourceData,
} from '../../../server/services/vergunningen/vergunningen';
import { horecaOptions } from '../../../server/services/horeca';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks';
import MockApp from '../MockApp';
import HorecaDetail from './HorecaDetail';

const content = transformVergunningenData(
  vergunningenData as VergunningenSourceData
).filter(horecaOptions.filter);

const testState = {
  HORECA: {
    status: 'OK',
    content,
  },
  NOTIFICATIONS: {
    status: 'OK',
    content: [],
  },
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

function MockVergunningDetail({ identifier }: { identifier: string }) {
  const vergunning = content.find((v) => v.identifier === identifier);
  const routeEntry = generatePath(AppRoutes['HORECA/DETAIL'], {
    title: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id,
  });
  const routePath = AppRoutes['HORECA/DETAIL'];

  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={HorecaDetail}
      initializeState={state(testState)}
    />
  );
}

describe('<HorecaDetail />', () => {
  describe('<ExploitatieHorecaBedrijf />', () => {
    it('should match fullpage snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/1808826" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
