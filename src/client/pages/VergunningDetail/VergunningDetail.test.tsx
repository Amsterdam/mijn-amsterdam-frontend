import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import { describe, expect, it, test } from 'vitest';
import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import VergunningDetail from './VergunningDetail';
import { bffApi } from '../../../test-utils';

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

export function MockVergunningDetail({ identifier }: { identifier: string }) {
  const vergunning = content.find((v) => v.identifier === identifier);
  const routeEntry = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    title: slug(vergunning?.caseType, {
      lower: true,
    }),
    id: vergunning?.id ?? '',
  });
  const routePath = AppRoutes['VERGUNNINGEN/DETAIL'];

  bffApi
    .get(/\/api\/v1\/services\/vergunningen\/documents\/list\/(.*)/)
    .reply(200, {
      content: [],
    });

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

  describe('Splitsingsvergunning - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1697573" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('VormenVanWoonruimte - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1697574" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Onttrekkingsvergunning voor sloop - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1797585" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Samenvoegingsvergunning - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/22/1797696" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Ligplaatsvergunning (VOB) - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/1797715" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Ligplaatsvergunning (VOB) - Verleend', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/1797714" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('RVV hele stad - In behandeling', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/1809938" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Eigen parkeerplaats', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230352" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Eigen parkeerplaats opheffen', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230376" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Touringcar dagontheffing', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230474" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Touringcar jaarontheffing', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230478" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('WVOS', () => {
    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230585" />
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should match the full page snapshot', () => {
      const { asFragment } = render(
        <MockVergunningDetail identifier="Z/23/2230696" />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
