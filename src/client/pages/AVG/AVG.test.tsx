import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks';
import MockApp from '../MockApp';
import AVG from './AVG';

const testState: any = {
  AVG: {
    status: 'OK',
    content: {
      verzoeken: [
        {
          id: '1',
          status: 'Open',
          registratieDatum: '',
          type: 'Inzage',
          thema: 'Parkeren',
          resultaat: '',
          ontvangstDatum: '2023-03-06T00:00:00.000Z',
          opschortenGestartOp: '2023-03-16T00:00:00.000Z',
          datumInBehandeling: '',
          datumAfhandeling: '',
          themas: ['avg thema 3'],
          link: {
            to: '/avg/verzoek/1',
            title: 'AVG verzoek 1',
          },
        },
        {
          id: '223',
          status: 'Afgehandeld',
          registratieDatum: '16-03-2023 14:37',
          type: 'Verwijderen gegevens',
          thema: 'Vergunningen',
          resultaat: '',
          ontvangstDatum: '2022-03-09T00:00:00.000Z',
          opschortenGestartOp: '',
          datumInBehandeling: '2023-03-16T00:00:00.000Z',
          datumAfhandeling: '2023-03-19T00:00:00.000Z',
          themas: ['avg thema 4', 'avg thema 1'],
          link: {
            to: '/avg/verzoek/223',
            title: 'AVG verzoek 223',
          },
        },
      ],
      aantal: 2,
    },
  },
};

function initializeState(testState: any) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

function setupTestComponent(testState: any) {
  const routeEntry = generatePath(AppRoutes.AVG);
  const routePath = AppRoutes.AVG;

  return () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AVG}
      initializeState={initializeState(testState)}
    />
  );
}

describe('AVG thema pagina', () => {
  it('Matches the Full Page snapshot when there are requests', () => {
    const Component = setupTestComponent(testState);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when there are no requests', () => {
    const Component = setupTestComponent({
      AVG: {
        status: 'OK',
        content: {
          verzoeken: [],
          aantal: 0,
        },
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when API gives no result', () => {
    const Component = setupTestComponent({
      AVG: {
        status: 'ERROR',
        content: null,
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
