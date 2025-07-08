import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Zorg-thema-config.ts';
import { ZorgThema } from './ZorgThema.tsx';
import { AppState } from '../../../../universal/types/App.types.ts';
import { appStateAtom } from '../../../hooks/useAppState.ts';
import MockApp from '../../MockApp.tsx';

const testState: Pick<AppState, 'WMO'> = {
  WMO: {
    status: 'OK',
    content: [
      {
        id: 'wmo-item-1',
        title: 'Wmo item 1',
        supplier: 'Mantelzorg B.V',
        dateDecision: '2020-07-24',
        dateDecisionFormatted: '24 juli 2020',
        statusDate: '2020-09-24',
        statusDateFormatted: '24 september 2020',
        isActual: true,
        link: {
          to: 'http://example.org/ding',
          title: 'Linkje!! naar wmo item 1',
        },
        displayStatus: 'Levering gestart',
        decision: 'Klaar',
        documents: [],
        itemTypeCode: 'WMO',
        steps: [
          {
            id: 'wmo-step-2',
            status: 'Besluit',
            datePublished: '2020-08-08',
            description: 'De levering van uw thuiszorg is gestart',
            documents: [],
            isActive: false,
            isChecked: true,
          },
          {
            id: 'wmo-step-1',
            status: 'Levering gestart',
            datePublished: '2020-09-24',
            description: 'De levering van uw thuiszorg is gestart',
            documents: [],
            isActive: true,
            isChecked: true,
          },
        ],
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState as AppState);
}

describe('<Zorg />', () => {
  const routeEntry = generatePath(routeConfig.themaPage.path);
  const routePath = routeConfig.themaPage.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={ZorgThema}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
