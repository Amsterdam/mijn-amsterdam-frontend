import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import VergunningDetail from './VergunningDetail';

const content = transformVergunningenData(vergunningenData as any);

const testState = {
  VERGUNNINGEN: {
    status: 'OK',
    content,
  },
  NOTIFICATIONS: {
    status: 'OK',
    content: [],
  },
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

function MockVergunningDetail({ identifier }: { identifier: string }) {
  const vergunning = content.find((v) => v.identifier === identifier);
  const routeEntry = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    title: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id,
  });
  const routePath = AppRoutes['VERGUNNINGEN/DETAIL'];

  return (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={VergunningDetail}
      initializeState={state(testState)}
    />
  );
}

describe('<VergunningDetail />', () => {
  beforeAll(() => {
    (window as any).scrollTo = jest.fn();
  });

  describe('<EvenementMelding />', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/000/000003" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<Flyeren />', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1597501" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<AanbiedenDiensten />', () => {
    it('should match the full page snapshot for multi date variant', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1597602" />
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should match the full page snapshot for single date variant', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1597471" />
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should match the full page snapshot for the status received variant', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1597712" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<GPP />', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/000/000009" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Nachtwerkontheffing', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1691001" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('BZP - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/19795392" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('BZP - Verleend', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/19795384" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('BZB - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1979538" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('BZB - Verleend', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1979539" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Zwaarverkeer', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1692013" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
