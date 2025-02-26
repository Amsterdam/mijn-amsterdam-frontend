import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../../universal/config/routes';
import { componentCreator } from '../MockApp';
import ThemaPaginaHLI from './HLI';
import { stadspasCreator } from './test-helpers';
import { AppState } from '../../../universal/types';

const createStadspas = stadspasCreator();

const createHLIComponent = componentCreator({
  component: ThemaPaginaHLI,
  routeEntry: generatePath(AppRoutes.HLI),
  routePath: AppRoutes.HLI,
});

describe('<HLI />', () => {
  test('Matches the Full Page snapshot with an active and a blocked pas', () => {
    const state = {
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
          stadspas: [
            createStadspas(
              { actief: true, balance: 5, balanceFormatted: '€5,00' },
              { firstname: 'Kerub' }
            ),
            createStadspas(
              { actief: false, balance: 4, balanceFormatted: '€4,00' },
              { firstname: 'Lou' }
            ),
          ],
        },
      },
    } as unknown as AppState;

    const Component = createHLIComponent(state);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
