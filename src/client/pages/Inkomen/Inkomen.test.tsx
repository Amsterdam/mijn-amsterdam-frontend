import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Inkomen from './Inkomen';

const testState: any = {
  WPI_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        title: 'Aanvraag inkomen item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'besluit',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
      },
      {
        title: 'Aanvraag inkomen item 2',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'herstelTermijn',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
      },
    ],
  },
  WPI_TOZO: {
    status: 'OK',
    content: [
      {
        title: 'Tozo 1 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'besluit',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
      },
      {
        title: 'Tozo 2 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'herstelTermijn',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
      },
    ],
  },
  WPI_TONK: {
    status: 'OK',
    content: [
      {
        title: 'Tonk 1 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'besluit',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
      },
      {
        title: 'Tonk 2 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'herstelTermijn',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
      },
    ],
  },
  WPI_BBZ: [],
  WPI_SPECIFICATIES: {
    status: 'OK',
    content: {
      jaaropgaven: [
        {
          title: 'Jaaropgave 2020',
          datePublished: '2020-07-14',
          id: 'jaaropgave-1',
          url: 'http://example.org/document/id',
          variant: null,
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
          variant: null,
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

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
