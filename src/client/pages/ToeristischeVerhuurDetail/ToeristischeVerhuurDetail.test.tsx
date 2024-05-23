import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { describe, expect, it } from 'vitest';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenToVerhuur } from '../../../server/services/toeristische-verhuur/toeristische-verhuur';
import {
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
} from '../../../server/services/vergunningen/vergunningen';
import { bffApi } from '../../../test-utils';
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

describe('<ToeristischVerhuurDetail />, vergunning', () => {
  bffApi.get(/\/relay\/decosjoin\/listdocuments\/(.*)/).reply(200, {
    content: [],
  });

  const vergunning = vergunningen?.find(
    (v) => v.caseType === 'Vakantieverhuur vergunningsaanvraag'
  );
  const routeEntry = generatePath(
    AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
    {
      id: vergunning?.id!,
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
    expect(screen.getByText('01 augustus 2023')).toBeInTheDocument();
    expect(screen.getAllByText('30 september 2024').length).toBe(2);
    expect(screen.getByText('Verleend')).toBeInTheDocument();
    expect(screen.getByText('Verlopen')).toBeInTheDocument();
  });
});
