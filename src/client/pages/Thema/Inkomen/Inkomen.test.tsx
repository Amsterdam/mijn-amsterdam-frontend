import { render } from '@testing-library/react';

import { themaConfig } from './Inkomen-thema-config.ts';
import { InkomenThema } from './InkomenThema.tsx';
import type { AppState } from '../../../../universal/types/App.types.ts';
import MockApp from '../../MockApp.tsx';

const testState = {
  WPI_AANVRAGEN: {
    status: 'OK',
    content: [
      {
        title: 'Aanvraag inkomen item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        id: 'aanvraag-1',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-1',
        },
      },
      {
        title: 'Aanvraag inkomen item 2',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        id: 'aanvraag-2',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-2',
        },
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
        id: 'aanvraag-3',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-3',
        },
      },
      {
        title: 'Tozo 2 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        id: 'aanvraag-4',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-4',
        },
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
        id: 'aanvraag-5',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-5',
        },
      },
      {
        title: 'Tonk 2 item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        id: 'aanvraag-6',
        steps: [
          {
            id: 'herstelTermijn',
            status: 'Meer informatie',
            datePublished: '2020-07-24',
          },
        ],
        link: {
          to: '/aanvraag-6',
        },
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
        id: 'aanvraag-7',
        about: 'Bbz',
        steps: [
          {
            id: 'besluit',
            status: 'Besluit',
            datePublished: '2022-07-24',
          },
        ],
        link: {
          to: '/aanvraag-7',
        },
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
  const routeEntry = themaConfig.route.path;

  test('with items from AANVRAGEN, BBZ, TONK, TOZO and SPECIFICATIES', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routeEntry}
          component={InkomenThema}
          state={testState as unknown as AppState}
        />
      );
    }

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('without items from BBZ, TONK, TOZO', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routeEntry}
          component={InkomenThema}
          state={
            {
              WPI_SPECIFICATIES: testState.WPI_SPECIFICATIES,
              WPI_AANVRAGEN: {},
              WPI_TOZO: {},
              WPI_TONK: {},
              WPI_BBZ: {},
            } as unknown as AppState
          }
        />
      );
    }

    const screen = render(<Component />);
    expect(screen.queryByText('Aanvraag inkomen item')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Aanvraag inkomen item 2')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Tozo 1 item')).not.toBeInTheDocument();
    expect(screen.getByText('Jaaropgave 2020')).toBeInTheDocument();
    // Uitkering shows datum only.
    expect(screen.getByText('14 Mei 2020')).toBeInTheDocument();
  });

  test('without items from BBZ, TONK, TOZO, but with AANVRAGEN', () => {
    function Component() {
      return (
        <MockApp
          routeEntry={routeEntry}
          routePath={routeEntry}
          component={InkomenThema}
          state={
            {
              WPI_SPECIFICATIES: {},
              WPI_AANVRAGEN: testState.WPI_AANVRAGEN,
              WPI_TOZO: {},
              WPI_TONK: {},
              WPI_BBZ: {},
            } as unknown as AppState
          }
        />
      );
    }

    const screen = render(<Component />);
    expect(screen.getByText('Aanvraag inkomen item')).toBeInTheDocument();
    expect(screen.getByText('Aanvraag inkomen item 2')).toBeInTheDocument();
    expect(screen.queryByText('Tozo 1 item')).not.toBeInTheDocument();
  });
});
