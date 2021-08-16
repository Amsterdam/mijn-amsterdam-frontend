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
import { CaseType } from '../../../universal/types/vergunningen';
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

type VerhuurState = Pick<AppState, 'TOERISTISCHE_VERHUUR'>;

const testState: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 26,
      registraties: toeristischeVerhuurRegistraties.content,
      title: 'Vakantieverhuur',
      vergunningen: transformVergunningenToVerhuur(vergunningen),
    },
  },
};

const testState2: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 2,
      registraties: [],
      title: 'Bed & Breakfast',
      vergunningen: transformVergunningenToVerhuur(vergunningen),
    },
  },
};

const testState3: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 2,
      registraties: toeristischeVerhuurRegistraties.content,
      title: 'Vakantieverhuur',
      vergunningen: transformVergunningenToVerhuur(vergunningen).filter(
        (vergunning) => vergunning.caseType === CaseType.BBVergunning
      ),
    },
  },
};

const testState4: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 2,
      title: 'Vakantieverhuur',
      registraties: toeristischeVerhuurRegistraties.content,
      vergunningen: transformVergunningenToVerhuur(vergunningen).filter(
        (vergunning) => vergunning.caseType !== CaseType.BBVergunning
      ),
    },
  },
};

const testState5: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      daysLeft: 0,
      title: 'Vakantieverhuur',
      registraties: toeristischeVerhuurRegistraties.content,
      vergunningen: transformVergunningenToVerhuur(vergunningen).filter(
        (vergunning) => vergunning.caseType !== CaseType.BBVergunning
      ),
    },
  },
};

function initializeState(snapshot: MutableSnapshot, state: VerhuurState) {
  snapshot.set(appStateAtom as any, state);
}

describe('<ToeristischeVerhuur />', () => {
  const routeEntry = generatePath(AppRoutes.TOERISTISCHE_VERHUUR);
  const routePath = AppRoutes.TOERISTISCHE_VERHUUR;

  const Component = ({ state }: { state: VerhuurState }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ToeristischeVerhuur}
      initializeState={(snap) => initializeState(snap, state)}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component state={testState} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows page for B&B and Vakantieverhuur permits', () => {
    render(<Component state={testState} />);
    expect(screen.getByText('Vakantieverhuur')).toBeInTheDocument();
    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Registratienummer toeristische verhuur').length
    ).toBe(1);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();
    expect(
      screen.getByText('U hebt nog 26 nachten dat u uw woning mag verhuren.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(3);
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(3);
    expect(screen.getByText('Geplande verhuur')).toBeInTheDocument();
    expect(screen.getByText('Geannuleerde verhuur')).toBeInTheDocument();
    expect(screen.getByText('Afgelopen verhuur')).toBeInTheDocument();

    expect(
      screen.findAllByText(
        'Het is niet toegestaan om op hetzelfde adres zowel aan vakantieverhuur als bed & breakfast te doen.'
      )
    ).not.toBe(null);
  });

  it('Shows alert for missing registration numbers', () => {
    render(<Component state={testState2} />);

    expect(
      screen.getByText(
        /U moet daarom ook een landelijk registratienummer voor toeristische verhuur aanvragen./
      )
    ).toBeInTheDocument();
  });

  it('Shows B&B page', () => {
    render(<Component state={testState3} />);

    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Meer informatie over bed & breakfast')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Vergunning vakantieverhuur')
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(3);
  });

  it('Shows Vakantieverhuur page', () => {
    render(<Component state={testState4} />);

    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Meer informatie over particuliere vakantieverhuur')
    ).toBeInTheDocument();

    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(3);
    expect(
      screen.queryByText('Vergunning bed & breakfast')
    ).not.toBeInTheDocument();
  });

  it('Shows Different text about nights rent left', () => {
    render(<Component state={testState5} />);

    expect(
      screen.getByText(/Uw woning is dit kalenderjaar al 30 nachten verhuurd./)
    ).toBeInTheDocument();
  });
});
