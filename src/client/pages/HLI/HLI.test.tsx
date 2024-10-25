import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import {
  StadspasFrontend,
  StadspasOwner,
} from '../../../server/services/hli/stadspas-types';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ThemaPaginaHLI from './HLI';
import { AppState } from '../../../universal/types';

const owner: StadspasOwner = {
  initials: '',
  firstname: '',
  lastname: '',
};

const stadspas: StadspasFrontend = {
  urlTransactions: '',
  transactionsKeyEncrypted: '123-xxx-000',
  id: 'stadspas-1',
  passNumber: 123123123,
  passNumberComplete: '0303123123123',
  owner,
  dateEnd: '31-07-2025',
  dateEndFormatted: '31 juli 2025',
  budgets: [],
  balanceFormatted: '',
  balance: 0,
};

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
      stadspas: [stadspas],
    },
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<HLI />', () => {
  const routeEntry = generatePath(AppRoutes.HLI);
  const routePath = AppRoutes.HLI;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ThemaPaginaHLI}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
