import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { listPageKind, themaConfig, tableConfig } from './HLI-thema-config';
import { HLIThema } from './HLIThema';
import { stadspasCreator } from './test-helpers';
import { createHLIState } from './test-helpers';
import type { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { componentCreator } from '../../MockApp';

const createStadspas = stadspasCreator();

const createHLIComponent = componentCreator({
  component: HLIThema,
  routeEntry: generatePath(themaConfig.route.path),
  routePath: themaConfig.route.path,
});

describe('<HLI />', () => {
  test('Matches the Full Page snapshot with an active and a blocked pas', () => {
    const stadspas = [
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
      createHLIState({ stadspas, regelingen })
    );
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('Unlimited amount of citypasses are visible', () => {
    // 20 is Arbitrary but it exceeds usual limit and might be a huge family.
    const stadspas = Array.from({ length: 20 }, () => createStadspas());

    const state = createHLIState({ stadspas });

    const Component = createHLIComponent(state);
    const screen = render(<Component />);

    const passes = screen.getAllByRole('row', { name: /Stadspas van/ });

    expect(passes.length).toBe(stadspas.length);
  });

  test('Filter regelingen for Aanvragen table', () => {
    const regelingen = [
      {
        displayStatus: 'toegewezen',
      },
      {
        displayStatus: 'In behandeling',
      },
      {
        displayStatus: 'In behandeling genomen',
      },
      {
        displayStatus:
          'In behandeling genomen in een ander tijdperk, het waren de 60s',
      },
      {
        displayStatus: 'Buiten behandeling',
      },
    ] as HLIRegelingFrontend[];

    expect(
      regelingen.filter(tableConfig[listPageKind.inProgress].filter)
    ).toEqual([regelingen[1], regelingen[2], regelingen[3]]);
  });
});
