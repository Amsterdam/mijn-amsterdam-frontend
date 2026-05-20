import { act, render, screen } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { describe, it } from 'vitest';

import type { AppState } from '../../../universal/types/App.types.ts';
import { componentCreator } from '../MockApp.tsx';
import { themaId } from './Dashboard-config.ts';
import { DashboardRoute } from './Dashboard-routes.ts';
import { Dashboard } from './Dashboard.tsx';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { bffApi } from '../../../testing/utils.ts';
import { toDateFormatted } from '../../../universal/helpers/date.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app.ts';

const DATE_NOW = '2021-09-22T09:00:00';

const afspraak: AfspraakFrontend = {
  cancellationLink:
    'http://remote-api-host/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  caseReference: '00157784',
  dateStartFormatted: '26 februari 2026',
  dateEndFormatted: '26 februari 2026',
  dateStart: '2026-02-26T09:00:00Z',
  dateEnd: '2026-02-26T09:20:00Z',
  displayDateTime: '26 februari 2026 van 10:00 tot 11:20 uur',
  location: {
    city: null,
    countryCode: 'NL',
    name: 'Zuidoost',
    postalCode: null,
    street: null,
  },
  qrCode: 'xxxxxxxxxxxxxxxxxxxx',
  status: 'New',
  subject: 'Varen Afspraak',
  link: {
    to: '/afspraak/00157784',
    title: 'Bekijk afspraak',
  },
  icsLink: {
    to: 'data:text/calendar;base64,abc123',
    title: 'Voeg toe aan agenda',
    download: `afspraak-00157784.ics`,
  },
};

const testState = {
  BRP: {
    status: 'OK',
    content: {
      mokum: true,
      persoon: {
        opgemaakteNaam: 'J. Jansen',
      },
    },
  },
  KVK: {
    status: 'OK',
    content: null,
  },
  MY_LOCATION: { status: 'OK', content: [{ latlng: { lat: 5, lng: 40 } }] },
  // Some themas
  BELASTINGEN: {
    content: {
      isKnown: true,
    },
  },
  MILIEUZONE: {
    content: {
      isKnown: true,
    },
  },
  VERGUNNINGEN: {
    isActive: true,
  },
  PARKEREN: {
    content: {
      isKnown: true,
      url: `${remoteApiHost}/sso/portaal/parkeren`,
    },
  },
  WPI_TOZO: {
    content: [{}],
  },
} as unknown as AppState;

describe('<Dashboard />', () => {
  const routeEntry = generatePath(DashboardRoute.route);
  const routePath = DashboardRoute.route;
  const createDashboardComponent = componentCreator({
    component: Dashboard,
    routeEntry,
    routePath,
  });

  beforeAll(() => {
    Mockdate.set(DATE_NOW);
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Renders dashboard correctly', async () => {
    bffApi.get('/services/cms/footer').reply(200);
    const Component = createDashboardComponent(testState);
    render(<Component />);

    expect(screen.getByRole('heading', { name: 'Goedemorgen' }));
    expect(screen.getByRole('heading', { name: `Mijn thema's` }));
    expect(
      screen.queryByRole('link', { name: 'Toon alle' })
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText('Verstuur zoekopdracht'));
  });

  describe('Afspraken', () => {
    it('Displays Panel when there are afspraken', () => {
      const state = {
        KLANT_CONTACT: {
          status: 'OK',
          content: {
            contactmomenten: [],
            afspraken: [afspraak],
          },
        },
      } as unknown as AppState;
      const Component = createDashboardComponent(state);
      const screen = render(<Component />);

      screen.getByRole('heading', { name: 'Afspraken bij een stadsloket' });
      screen.getByRole('heading', { name: 'Varen Afspraak' });
    });

    it('Does not display Panel when there are no afspraken', () => {
      const state = {
        KLANT_CONTACT: [
          {
            status: 'OK',
            content: {
              afspraken: [],
              contactmomenten: [],
            },
          },
        ],
      } as unknown as AppState;
      const Component = createDashboardComponent(state);
      const screen = render(<Component />);

      expect(screen.getByRole('heading', { name: 'Goedemorgen' }));
      expect(
        screen.queryByRole('heading', { name: 'Aankomende afspraken' })
      ).not.toBeInTheDocument();
    });

    it('Displays link to listpage when there are too many afspraken', () => {
      const state = {
        KLANT_CONTACT: {
          status: 'OK',
          content: {
            contactmomenten: [],
            afspraken: new Array(MAX_TABLE_ROWS_ON_THEMA_PAGINA + 1)
              .fill(afspraak)
              // caseReference is used as key in react, so it must be unique from other items.
              .map((a, i) => ({ ...a, caseReference: i })),
          },
        },
      } as unknown as AppState;
      const Component = createDashboardComponent(state);
      const screen = render(<Component />);

      expect(
        screen.getAllByRole('heading', { name: 'Varen Afspraak' })
      ).toHaveLength(MAX_TABLE_ROWS_ON_THEMA_PAGINA);
      screen.getByRole('link', { name: 'Toon meer' });
    });
  });

  describe('Notifications', () => {
    const state = {
      NOTIFICATIONS: {
        status: 'OK',
        content: [
          {
            id: 'Not1',
            title: 'Notification 1',
            description: 'Notificatie1',
            datePublished: '2020-07-24',
            themaID: themaId,
            link: {
              to: '/item-1',
              title: 'Linkje!',
            },
          },
          {
            id: 'Not2',
            title: 'Notification 2',
            description: 'Notificatie2',
            datePublished: '2021-07-24',
            themaID: themaId,
            link: {
              to: '/item-2',
              title: 'Linkje!',
            },
          },
          {
            id: 'Not3',
            title: 'Notification 3',
            description: 'Notificatie3',
            datePublished: '2022-07-24',
            themaID: themaId,
            isAlert: true,
            link: {
              to: '/item-3',
              title: 'Linkje!',
            },
          },
        ],
      },
    } as unknown as AppState;
    const notifications =
      state.NOTIFICATIONS.content?.map((notification) => [
        notification.title,
        toDateFormatted(notification.datePublished),
      ]) || [];
    bffApi.get('/services/cms/footer').times(notifications.length).reply(200);
    const Component = createDashboardComponent(state);

    test.each(notifications)(
      'Notification %s with date %s exists',
      async (title, datePublished) => {
        await act(() => render(<Component />));

        expect(
          screen.getByRole('heading', { name: title })
        ).toBeInTheDocument();
        expect(screen.getByText(datePublished)).toBeInTheDocument();
      }
    );
  });
});
