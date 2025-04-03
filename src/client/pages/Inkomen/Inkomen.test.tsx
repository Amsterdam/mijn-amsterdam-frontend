import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { InkomenThemaPagina } from './Inkomen';

const testState: any = {
  WPI_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        title: 'Aanvraag inkomen item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        statusId: 'besluit',
        id: 'aanvraag-1',
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
        id: 'aanvraag-2',
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
        id: 'aanvraag-3',
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
        id: 'aanvraag-4',
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
        id: 'aanvraag-5',
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
        id: 'aanvraag-6',
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
  WPI_BBZ: {
    status: 'OK',
    content: [
      {
        title: 'Bbz item',
        datePublished: '2022-07-24',
        dateStart: '2022-07-14',
        statusId: 'besluit',
        id: 'aanvraag-7',
        about: 'Bbz',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2022-07-24',
          },
        ],
      },
    ],
  },
  WPI_SPECIFICATIES: {
    status: 'OK',
    content: {
      jaaropgaven: [
        {
          title: 'Jaaropgave 2020',
          datePublished: '2020-07-14',
          id: 'jaaropgave-1',
          url: '/wpi/document/id',
          variant: null,
          datePublishedFormatted: '14 Juli 2020',
          documentUrl: '/wpi/document/id',
        },
      ],
      uitkeringsspecificaties: [
        {
          title: 'Specificatie Mei 2020',
          datePublished: '2020-05-14',
          id: 'spec-1',
          url: '/wpi/document/id',
          variant: null,
          datePublishedFormatted: '14 Mei 2020',
          documentUrl: '/wpi/document/id',
        },
      ],
    },
  },
};

describe('<Inkomen />', () => {
  describe('with items from BBZ, TONK, TOZO', () => {
    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, testState);
    }

    const routeEntry = generatePath(AppRoutes.INKOMEN);
    const routePath = AppRoutes.INKOMEN;

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={InkomenThemaPagina}
          initializeState={initializeState}
        />
      );
    }

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('without items from BBZ, TONK, TOZO', () => {
    function initializeState(snapshot: MutableSnapshot) {
      const { WPI_SPECIFICATIES } = testState;
      snapshot.set(appStateAtom, {
        WPI_SPECIFICATIES,
        WPI_AANVRAGEN: {},
        WPI_TOZO: {},
        WPI_TONK: {},
        WPI_BBZ: {},
      } as any);
    }

    const routeEntry = generatePath(AppRoutes.INKOMEN);
    const routePath = AppRoutes.INKOMEN;

    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routePath}
          component={InkomenThemaPagina}
          initializeState={initializeState}
        />
      );
    }

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
