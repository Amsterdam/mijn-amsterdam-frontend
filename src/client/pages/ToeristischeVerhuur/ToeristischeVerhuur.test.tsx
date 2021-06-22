import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import toeristischeVerhuurRegistraties from '../../../server/mock-data/json/registraties-toeristische-verhuur.json';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import {
  transformVergunningenToVerhuur,
  VakantieverhuurVergunning,
} from '../../../server/services/toeristische-verhuur';
import {
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
  Vergunning,
  VergunningenData,
} from '../../../server/services/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { AppState } from '../../AppState';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischeVerhuur from './ToeristischeVerhuur';

const vergunningen = transformVergunningenData(
  vergunningenData as ApiSuccessResponse<VergunningenData>
)
  .filter((vergunning: Vergunning): vergunning is VakantieverhuurVergunning =>
    toeristischeVerhuurVergunningTypes.includes(vergunning.caseType)
  )
  .map((vergunning) => ({
    ...vergunning,
    link: { to: AppRoutes.TOERISTISCHE_VERHUUR, title: vergunning.title },
  }));

const testState: Pick<AppState, 'TOERISTISCHE_VERHUUR'> = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 26,
      registraties: toeristischeVerhuurRegistraties.content,
      vergunningen: transformVergunningenToVerhuur(vergunningen),
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom as any, testState);
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
      screen.getByText('Meer informatie over particuliere vakantieverhuur')
    ).toBeInTheDocument();
    expect(
      // screen.getByText('Meer over toeristenbelasting')
      screen.getByText('Meer informatie over bed & breakfast')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Registratienummer toeristische verhuur').length
    ).toBe(1);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft nog 26 dagen dat u uw woning mag verhuren.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(2);
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(2);
    expect(screen.getByText('Geplande verhuur')).toBeInTheDocument();
    expect(screen.getByText('Geannuleerde verhuur')).toBeInTheDocument();
    expect(screen.getByText('Afgelopen verhuur')).toBeInTheDocument();
  });
});
