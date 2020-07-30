import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import InkomenDetail from './InkomenDetail';

const testState = {
  FOCUS_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        id: 'aanvraag-1',
        title: 'Aanvraag inkomen item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
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
            product: 'Bijstandsuitkering',
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

describe('<InkomenDetail />', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/BIJSTANDSUITKERING'], {
    id: testState.FOCUS_AANVRAGEN.content[0].id,
  });
  const routePath = AppRoutes['INKOMEN/BIJSTANDSUITKERING'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={InkomenDetail}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    shallow(<Component />);
  });

  it('Matches the Full Page snapshot', () => {
    const html = mount(<Component />).html();

    expect(html).toMatchSnapshot();
  });
});
