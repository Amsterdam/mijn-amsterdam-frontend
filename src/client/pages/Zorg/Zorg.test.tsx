import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Zorg from './Zorg';

const testState: any = {
  WMO: {
    status: 'OK',
    content: [
      {
        id: 'wmo-item-1',
        title: 'Wmo item 1',
        supplier: 'Mantelzorg B.V',
        isActual: true,
        link: {
          to: 'http://example.org/ding',
          title: 'Linkje!! naar wmo item 1',
        },
        steps: [
          {
            id: 'wmo-step-1',
            status: 'Levering gestart',
            datePublished: '2020-07-24',
            description: 'De levering van uw thuizorg is gestart',
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
  snapshot.set(appStateAtom, testState);
}

describe('<Zorg />', () => {
  const routeEntry = generatePath(AppRoutes.ZORG);
  const routePath = AppRoutes.ZORG;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Zorg}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
