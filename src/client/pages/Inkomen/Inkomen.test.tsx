import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Inkomen from './Inkomen';

const testState = {
  GPASS_STADSPAS: {
    content: [
      {
        id: 'xxx123123123123',
        pasnummer: '123123123123',
        datumAfloop: '2020-12-12',
        naam: 'Ramses rawjingakoli',
        budgets: [
          {
            title: 'KLEDING-EN-EDUCATIE',
            assigned: 220,
            balance: 130,
          },
          {
            title: 'SPORT-EN-SPEL',
            assigned: 220,
            balance: 80,
          },
        ],
      },
      {
        id: 'xxx89899898',
        pasnummer: '89899898',
        datumAfloop: '2021-04-23',
        naam: 'Jawh rawjingakoli',
        budgets: [
          {
            title: 'SPORT-EN-SPEL',
            assigned: 220,
            balance: 80,
          },
        ],
      },
    ],
    status: 'OK',
  },
  FOCUS_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        title: 'Aanvraag inkomen item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
        steps: [],
      },
      {
        title: 'Aanvraag inkomen item 2',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Meer informatie',
        steps: [],
      },
    ],
  },
  FOCUS_TOZO: {
    status: 'OK',
    content: [
      {
        title: 'Tozo 1 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
        steps: [],
      },
      {
        title: 'Tozo 2 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Meer informatie',
        steps: [],
      },
    ],
  },
  FOCUS_SPECIFICATIES: {
    status: 'OK',
    content: {
      jaaropgaven: [
        {
          title: 'Jaaropgave 2020',
          datePublished: '2020-07-14',
          id: 'jaaropgave-1',
          url: 'http://example.org/document/id',
          type: 'jaaropgave',
          displayDatePublished: '14 Juli 2020',
          documentUrl: 'http://example.org/document/id',
        },
      ],
      uitkeringsspecificaties: [
        {
          title: 'Specificatie Mei 2020',
          datePublished: '2020-05-14',
          id: 'spec-1',
          url: 'http://example.org/document/id',
          type: 'uitkeringsspecificatie',
          displayDatePublished: '14 Mei 2020',
          documentUrl: 'http://example.org/document/id',
        },
      ],
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Inkomen />', () => {
  const routeEntry = generatePath(AppRoutes.INKOMEN);
  const routePath = AppRoutes.INKOMEN;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Inkomen}
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
