import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import StatusDetail from './StatusDetail';

const testState: any = {
  FOCUS_TOZO: {
    status: 'OK',
    content: [
      {
        id: 'aanvraag-1',
        title: 'Aanvraag Tozo na xxx',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
        productTitle: 'Tozo 1',
        steps: [
          {
            id: 'step1',
            documents: [
              {
                id: 'doc1',
                title: 'Documentje',
                url: 'http://example.org/blaat',
              },
            ],
            title: 'aanvraag',
            description: '<p>Uw aanvraag is binngekomen</p>',
            datePublished: '2020-07-24',
            status: 'aanvraag',
            product: 'Tozo 1',
            isActive: true,
            isChecked: true,
            decision: undefined,
          },
        ],
      },
      {
        id: 'aanvraag-2',
        title: 'Aanvraag inkomen item 2',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Meer informatie',
        steps: [],
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<StatusDetail />', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/TOZO'], {
    id: testState.FOCUS_TOZO.content[0].id,
    version: '2',
  });
  const routePath = AppRoutes['INKOMEN/TOZO'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={StatusDetail}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
