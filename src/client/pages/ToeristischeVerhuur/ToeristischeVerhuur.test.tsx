import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import {
  transformVergunningenToVerhuur,
  VakantieverhuurVergunning,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur';
import {
  toeristischeVerhuurVergunningTypes,
  transformVergunningenData,
  Vergunning,
  VergunningenData,
} from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { CaseType } from '../../../universal/types/vergunningen';
import { AppState } from '../../AppState';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ToeristischeVerhuur from './ToeristischeVerhuur';
import {
  vi,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  test,
  it,
  describe,
} from 'vitest';

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

const registraties = [
  {
    city: 'Amsterdam',
    houseLetter: null,
    houseNumber: '16',
    houseNumberExtension: null,
    postalCode: '1014AW',
    registrationNumber: '0363 E7B8 B042 8A92 37E5',
    shortName: 'Schakelstraat',
    street: 'Schakelstraat',
    agreementDate: '2021-05-20',
  },
  {
    city: 'Amsterdam',
    houseLetter: null,
    houseNumber: '1',
    houseNumberExtension: null,
    postalCode: '1017AB',
    registrationNumber: 'E7B8 B042 8A92 37E5 0363',
    shortName: 'Amstel',
    street: 'Amstel',
    agreementDate: '2020-05-20',
  },
];

const testState: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      registraties,
      vergunningen: transformVergunningenToVerhuur(
        vergunningen,
        new Date('2021-09-22')
      ),
    },
  },
};

const testState2: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      registraties: [],
      vergunningen: transformVergunningenToVerhuur(
        vergunningen,
        new Date('2021-09-22')
      ),
    },
  },
};

const testState3: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      registraties,
      vergunningen: transformVergunningenToVerhuur(
        vergunningen,
        new Date('2021-09-22')
      ).filter((vergunning) => vergunning.caseType === CaseType.BBVergunning),
    },
  },
};

const testState4: VerhuurState = {
  TOERISTISCHE_VERHUUR: {
    status: 'OK',
    content: {
      registraties,
      vergunningen: transformVergunningenToVerhuur(
        vergunningen,
        new Date('2021-09-22')
      ).filter((vergunning) => vergunning.caseType !== CaseType.BBVergunning),
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

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-09-22').getTime());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component state={testState} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows page for B&B and Vakantieverhuur permits', () => {
    const screen = render(<Component state={testState} />);
    expect(screen.getAllByText(/Toeristische verhuur/)[0]).toBeInTheDocument();
    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText('Registratienummer toeristische verhuur').length
    ).toBe(1);
    expect(screen.getByText('E7B8 B042 8A92 37E5 0363')).toBeInTheDocument();
    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(5);
    expect(screen.getAllByText('Vergunning bed & breakfast').length).toBe(3);

    expect(
      screen.getByText(
        /Het is niet toegestaan om op hetzelfde adres zowel aan vakantieverhuur als bed & breakfast te doen\./i
      )
    ).toBeInTheDocument();
  });

  it('Shows alert for missing registration numbers', () => {
    const screen = render(<Component state={testState2} />);

    expect(
      screen.getByText(
        /U moet daarom ook een landelijk registratienummer voor toeristische verhuur aanvragen./
      )
    ).toBeInTheDocument();
  });

  it('Shows B&B page', () => {
    const screen = render(<Component state={testState3} />);

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
    const screen = render(<Component state={testState4} />);

    expect(
      screen.getByText('Meer over toeristenbelasting')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Meer informatie over particuliere vakantieverhuur')
    ).toBeInTheDocument();

    expect(screen.getAllByText('Vergunning vakantieverhuur').length).toBe(5);
    expect(
      screen.queryByText('Vergunning bed & breakfast')
    ).not.toBeInTheDocument();
  });
});
