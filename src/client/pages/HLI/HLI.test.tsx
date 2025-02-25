import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ThemaPaginaHLI from './HLI';
import { stadspasCreator } from './test-helpers';
import { AppState } from '../../../universal/types';

const createStadspas = stadspasCreator();

const testState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [
        {
          id: 'hli-item-1',
          title: 'hli item 1',
          dateDecision: '2020-07-24',
          isActual: true,
          link: {
            to: 'http://example.org/ding',
            title: 'Linkje!! naar hli item 1',
          },
          documents: [],
          steps: [
            {
              id: 'hli-step-2',
              status: 'Besluit',
              datePublished: '2020-08-08',
              description: 'U krijgt HLI Item',
              documents: [],
              isActive: false,
              isChecked: true,
            },
            {
              id: 'hli-step-1',
              status: 'Levering gestart',
              datePublished: '2020-09-24',
              description: 'De levering van uw HLI item is gestart',
              documents: [],
              isActive: true,
              isChecked: true,
            },
          ],
          dateEnd: null,
          dateStart: null,
          displayStatus: 'Levering gestart',
          receiver: 'Naam Persoon 1, Naam Persoon 2',
          decision: 'toegewezen',
        },
      ],
      stadspas: [createStadspas('Kerub', true), createStadspas('Lou', false)],
    },
  },
} as unknown as AppState;

const routeEntry = generatePath(AppRoutes.HLI);
const routePath = AppRoutes.HLI;

export function createComponent(state: AppState, component: () => JSX.Element) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={component}
        initializeState={initializeState}
      />
    );
  }

  return Component;
}

describe('<HLI />', () => {
  it('Matches the Full Page snapshot with an active and a blocked pas', () => {
    const Component = createComponent(testState, ThemaPaginaHLI);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
