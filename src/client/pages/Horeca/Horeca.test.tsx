import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import {
  addLinks,
  transformVergunningenData,
  VergunningenSourceData,
} from '../../../server/services';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { AppRoutes } from '../../../universal/config';
import { horecaOptions } from '../../../server/services/horeca';
import { appStateAtom } from '../../hooks';
import MockApp from '../MockApp';
import Horeca from './Horeca';

const testState: any = {
  HORECA: {
    status: 'OK',
    content: addLinks(
      transformVergunningenData(
        vergunningenData as VergunningenSourceData
      ).filter(horecaOptions.filter),
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
