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
  jest.useFakeTimers('modern').setSystemTime(new Date('2021-06-10').getTime());

  (window as any).scrollTo = jest.fn();

  const vergunning = vergunningen?.find(
    (vergunning) =>
      vergunning.caseType === 'Vakantieverhuur' && vergunning.isActual
  );

  const routeEntry = generatePath(
    AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'],
    {
      id: vergunning?.id,
    }
  );

  const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'];

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

  it('Show correct properties for detail page', () => {
    render(<Component />);
    expect(screen.getAllByText('10 mei 2021').length).toBe(3);
    expect(screen.getByText('10 juli 2021')).toBeInTheDocument();
    expect(screen.getByText('14 juli 2021')).toBeInTheDocument();
    expect(screen.getByText('Ontvangen')).toBeInTheDocument();
    expect(screen.getByText('Gemeld')).toBeInTheDocument();
  });
});

describe('<ToeristischVerhuurDetail />, vergunning', () => {
  (window as any).scrollTo = jest.fn();
  const vergunning = vergunningen?.find(
    (v) => v.caseType === 'Vakantieverhuur vergunningsaanvraag'
  );
  const routeEntry = generatePath(
    AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
    {
      id: vergunning?.id,
    }
  );
  const routePath = AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'];
  let Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ToeristischVerhuurDetail}
      initializeState={state(testState)}
    />
  );

  it('Show correct properties for detail page', () => {
    render(<Component />);
    expect(screen.getByText('Vergunning vakantieverhuur')).toBeInTheDocument();
    expect(screen.getByText('Vanaf')).toBeInTheDocument();
    expect(screen.getByText('Tot')).toBeInTheDocument();
    expect(screen.getByText('01 juni 2019')).toBeInTheDocument();
    expect(screen.getByText('31 mei 2020')).toBeInTheDocument();
    expect(screen.getByText('Verleend')).toBeInTheDocument();
  });
});
