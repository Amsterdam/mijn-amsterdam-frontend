import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks';
import MockApp from '../MockApp';
import AVGDetail from './AVGDetail';

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
          themas: ['Parkeren'],
          resultaat: '',
          ontvangstDatum: '2023-03-06T00:00:00.000Z',
          opschortenGestartOp: '2023-03-16T00:00:00.000Z',
          datumInBehandeling: '',
          datumAfhandeling: '',
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
          themas: ['Vergunningen'],
          resultaat: '',
          ontvangstDatum: '2022-03-09T00:00:00.000Z',
          opschortenGestartOp: '',
          datumInBehandeling: '2023-03-16T00:00:00.000Z',
          datumAfhandeling: '2023-03-19T00:00:00.000Z',
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

function setupTestComponent(id: string) {
  const routeEntry = generatePath(AppRoutes['AVG/DETAIL'], {
    id,
  });
  const routePath = AppRoutes['AVG/DETAIL'];

  return () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={AVGDetail}
      initializeState={initializeState(testState)}
    />
  );
}

describe('AVGDetail', () => {
  describe('No result', () => {
    const Component = setupTestComponent('abc');

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('With result', () => {
    const Component = setupTestComponent('223');

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
