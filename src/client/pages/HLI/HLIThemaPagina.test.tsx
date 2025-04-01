import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { AppRoutes } from '../../../universal/config/routes';
import { componentCreator } from '../MockApp';
import { HLIThemaPagina } from './HLIThemaPagina';
import { stadspasCreator } from './test-helpers';
import { createHLIState } from './test-helpers';

const createStadspas = stadspasCreator();

const createHLIComponent = componentCreator({
  component: HLIThemaPagina,
  routeEntry: generatePath(AppRoutes.HLI),
  routePath: AppRoutes.HLI,
});

describe('<HLI />', () => {
  test('Matches the Full Page snapshot with an active and a blocked pas', () => {
    const stadspassen = [
      createStadspas(
        { actief: true, balance: 5, balanceFormatted: '€5,00' },
        { firstname: 'Kerub' }
      ),
      createStadspas(
        { actief: false, balance: 4, balanceFormatted: '€4,00' },
        { firstname: 'Lou' }
      ),
    ];
    const regelingen = [
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
    ];
    const Component = createHLIComponent(
      createHLIState({ stadspassen, regelingen })
    );
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('Unlimited amount of citypasses are visible', () => {
    // 20 is Arbitrary but it exceeds usual limit and might be a huge family.
    const stadspassen = Array.from({ length: 20 }, () => createStadspas());

    const state = createHLIState({ stadspassen });

    const Component = createHLIComponent(state);
    const screen = render(<Component />);

    const passes = screen.getAllByRole('row', { name: /Stadspas van/ });

    expect(passes.length).toBe(stadspassen.length);
  });
});
