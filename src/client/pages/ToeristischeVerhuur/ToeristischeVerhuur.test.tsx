import ToeristischeVerhuur from './ToeristischeVerhuur';

import { render, screen } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import toeristischeVerhuurRegistraties from '../../../server/mock-data/json/registraties-toeristische-verhuur.json';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { toeristischeVerhuurVergunningTypes } from '../../../server/services/vergunningen';
import { transformVergunningenToVerhuur } from '../../../server/services/toeristische-verhuur';

const testState: any = {
  TOERISTISCHE_VERHUUR: {
    content: {
      daysLeft: 26,
      registraties: toeristischeVerhuurRegistraties.content,
      vergunningen: transformVergunningenToVerhuur(
        (vergunningenData as any)?.content?.filter((vergunning: any) =>
          toeristischeVerhuurVergunningTypes.includes(vergunning.caseType)
        )
      ),
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
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
      screen.getByText(
        'Meer informatie over regels voor Particuliere vakantieverhuur'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Landelijk registratienummer toeristische verhuur')
        .length
    ).toBe(2);
    expect(screen.queryAllByText('Adres verhuurde woning').length).toBe(2);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft nog 26 dagen dat u uw woning mag verhuren.')
    ).toBeInTheDocument();
    expect(screen.getByText('Vergunning vakantieverhuur')).toBeInTheDocument();
    expect(screen.getByText('Geplande verhuur (1)')).toBeInTheDocument();
    expect(screen.getByText('Geannuleerde verhuur (1)')).toBeInTheDocument();
    expect(screen.getByText('Afgelopen verhuur (1)')).toBeInTheDocument();
  });
});
