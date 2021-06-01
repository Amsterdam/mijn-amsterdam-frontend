import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenToVerhuur } from '../../../server/services/toeristische-verhuur';
import {
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
} from '../../../server/services/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischVerhuurDetail from './ToeristischeVerhuurDetail';

const transformedVergunningen = transformVergunningenData(
  vergunningenData as any
);

const vergunningen = transformVergunningenToVerhuur(
  transformedVergunningen.filter((vergunning: any) =>
    toeristischeVerhuurVergunningTypes.includes(vergunning.caseType)
  ) as any
);

const testState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: { vergunningen },
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
  const vergunning = vergunningen?.find(
    (vergunning) => vergunning.caseType === 'Vakantieverhuur'
  );
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
  render(<Component />);
  expect(screen.getAllByText('10 mei 2021').length).toBe(3);
  expect(screen.getByText('10 juli 2021')).toBeInTheDocument();
  expect(screen.getByText('14 juli 2021')).toBeInTheDocument();
  expect(screen.getByText('Ontvangen')).toBeInTheDocument();
  expect(screen.getByText('Verleend')).toBeInTheDocument();
});

describe('<ToeristischVerhuurDetail />, vergunning', () => {
  (window as any).scrollTo = jest.fn();
  const vergunning = vergunningen?.find(
    (v) => v.caseType === 'Vakantieverhuur vergunningsaanvraag'
  );
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
  render(<Component />);
  expect(
    screen.getAllByText('Vakantieverhuur vergunningsaanvraag').length
  ).toBe(1);
  expect(screen.getByText('Vanaf')).toBeInTheDocument();
  expect(screen.getByText('Tot en met')).toBeInTheDocument();
  expect(screen.getByText('01 juni 2019')).toBeInTheDocument();
  expect(screen.getByText('31 mei 2020')).toBeInTheDocument();
  expect(screen.getByText('In behandeling')).toBeInTheDocument();
  expect(screen.getByText('Afgehandeld')).toBeInTheDocument();
});
