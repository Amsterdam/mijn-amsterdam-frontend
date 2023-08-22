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

export function MockVergunningDetail({ identifier }: { identifier: string }) {
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

  describe('RVV Sloterweg', () => {
    const zaken: Array<{ title: string; identifier: string }> = [
      {
        title: 'RVV ontheffing Sloterweg (Nieuw/Verleend)',
        identifier: 'Z/23/98798273423',
      },
      {
        title: 'RVV ontheffing Sloterweg (Wijziging/Ontvangen)',
        identifier: 'Z/23/98989234',
      },
      {
        title: 'RVV ontheffing Sloterweg (Wijziging/Ingetrokken)',
        identifier: 'Z/23/23423409',
      },
      {
        title: 'RVV ontheffing Sloterweg (Wijziging/Verleend)',
        identifier: 'Z/23/091823087',
      },
      {
        title: 'RVV ontheffing Sloterweg (Wijziging/Verlopen)',
        identifier: 'Z/23/92222273423',
      },
      {
        title: 'RVV ontheffing Sloterweg (Nieuw/Verlopen)',
        identifier: 'Z/23/98744444423',
      },
      {
        title: 'RVV ontheffing Sloterweg (Nieuw/Ingetrokken)',
        identifier: 'Z/23/123123456',
      },
    ];

    for (const zaak of zaken) {
      test(`${zaak.title}`, () => {
        const { asFragment } = render(
          <MockVergunningDetail identifier={zaak.identifier} />
        );
        expect(asFragment()).toMatchSnapshot();
      });
    }
  });
});
