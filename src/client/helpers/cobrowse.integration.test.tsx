import { ComponentType } from '@react-spring/web';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { describe, it } from 'vitest';

import { AppState } from '../../universal/types/App.types';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { DashboardRoute } from '../pages/Dashboard/Dashboard-routes';
import MockApp from '../pages/MockApp';
import { MyNotificationsPage } from '../pages/MyNotifications/MyNotifications';
import {
  themaId as themaIdAfis,
  themaTitle as themaTitleAfis,
} from '../pages/Thema/Afis/Afis-thema-config';
import {
  themaId as themaIdBezwaren,
  themaTitle as themaTitleBezwaren,
} from '../pages/Thema/Bezwaren/Bezwaren-thema-config';
import { BezwarenDetail } from '../pages/Thema/Bezwaren/BezwarenDetail';
import { BezwarenList } from '../pages/Thema/Bezwaren/BezwarenList';
import { BezwarenThema } from '../pages/Thema/Bezwaren/BezwarenThema';
import { mapperContactmomentToMenuItem } from '../pages/Thema/Profile/private/Contactmomenten.config';
import { ContactmomentenListPage } from '../pages/Thema/Profile/private/ContactmomentenListPage';
import { MijnGegevensThema } from '../pages/Thema/Profile/private/ProfilePrivate';
import {
  themaId as themaIdVergunningen,
  themaTitle as themaTitleVergunningen,
} from '../pages/Thema/Vergunningen/Vergunningen-thema-config';

const testState = {
  KLANT_CONTACT: {
    status: 'OK',
    content: [
      {
        subject: Object.entries(mapperContactmomentToMenuItem).find(
          ([_, themaId]) => themaId === themaIdAfis
        )?.[0],
        themaKanaal: themaTitleAfis, // We misuse this to keep things together
      },
      {
        subject: themaIdVergunningen,
      },
    ],
  },
  BRP: {
    status: 'OK',
    content: {
      mokum: true,
      persoon: {
        opgemaakteNaam: 'J. Jansen',
        bsn: '001002003',
      },
    },
  },
  KVK: {
    status: 'OK',
    content: null,
  },
  MY_LOCATION: { status: 'OK', content: [{ latlng: { lat: 5, lng: 40 } }] },
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: `Notification ${themaTitleBezwaren}`,
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: themaIdBezwaren,
        themaTitle: themaTitleBezwaren,
        link: {
          to: '/item-1',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not2',
        title: `Notification ${themaTitleVergunningen}`,
        description: 'Notificatie2',
        datePublished: '2021-07-24',
        themaID: themaIdVergunningen,
        themaTitle: themaTitleVergunningen,
        link: {
          to: '/item-2',
          title: 'Linkje!',
        },
      },
    ],
  },
  // Some themas
  AFIS: {
    isActive: true,
    content: {
      isKnown: true,
      businessPartnerIdEncrypted: 'bpIDEncrypted-555',
      facturen: {
        open: {
          count: 0,
          facturen: [],
        },
        afgehandeld: {
          count: 0,
          facturen: [],
        },
        overgedragen: { count: 0, facturen: [] },
      },
    },
  },
  BEZWAREN: {
    isActive: true,
    content: [
      {
        identificatie: 'BI.21.014121.001',
      },
    ],
  },
  VERGUNNINGEN: {
    status: 'OK',
    content: [
      {
        caseType: 'GPK',
        title: 'Europse gehandicaptenparkeerkaart (GPK)',
        identifier: 'Z/000/000008',
        status: 'Ontvangen',
        description: 'Amstel 1 GPK aanvraag',
      },
    ],
  },
} as unknown as AppState;

describe('Cobrowse redacted components', () => {
  const routeEntry = generatePath(DashboardRoute.route);
  const routePath = DashboardRoute.route;

  function Component({ component }: { component: ComponentType }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={component}
        state={testState}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2021-09-22T09:00:00');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  describe('Cobrowse redacted components', () => {
    describe('Dashboard', () => {
      it('<MyThemasPanel />', async () => {
        await act(() => render(<Component component={Dashboard} />));
        expect(screen.getByTestId(themaTitleBezwaren)).toHaveClass('redacted');
        expect(screen.getByTestId(themaTitleVergunningen)).not.toHaveClass(
          'redacted'
        );
      });

      it('Notifications', async () => {
        await act(() => render(<Component component={Dashboard} />));
        const listItems = screen.getAllByRole('listitem');
        const redactedNotification = listItems.find((li) =>
          li.textContent?.includes(themaTitleBezwaren)
        );
        expect(redactedNotification).toHaveClass('redacted');
        const nonRedactedNotification = listItems.find((li) =>
          li.textContent?.includes(themaTitleVergunningen)
        );
        expect(nonRedactedNotification).not.toHaveClass('redacted');
      });
    });

    it('Notifications', async () => {
      await act(() => render(<Component component={MyNotificationsPage} />));
      const listItems = screen.getAllByRole('listitem');
      const redactedNotification = listItems.find((li) =>
        li.textContent?.includes(themaTitleBezwaren)
      );
      expect(redactedNotification).toHaveClass('redacted');
      const nonRedactedNotification = listItems.find((li) =>
        li.textContent?.includes(themaTitleVergunningen)
      );
      expect(nonRedactedNotification).not.toHaveClass('redacted');
    });

    test.each([
      ['Thema', BezwarenThema],
      ['ThemaDetail', BezwarenDetail],
      ['ThemaList', BezwarenList],
    ])('%s', async (_, component) => {
      await act(() => render(<Component component={component} />));
      const cobrowseElem = document.querySelector(
        '.mams-content-wrapper.redacted'
      ) as HTMLElement;
      expect(cobrowseElem).toBeInTheDocument();

      // Make sure the redacted is on the correct element and redacts the page content
      const cobrowseElemText = cobrowseElem?.innerText;
      const textOnlyInElem = themaTitleBezwaren;
      expect(cobrowseElemText).toContain(textOnlyInElem);

      const fullDocumentText = document.body.innerText;
      const outsideCobrowseElemText = fullDocumentText.replace(
        cobrowseElemText,
        ''
      );
      expect(outsideCobrowseElemText).not.toContain(textOnlyInElem);
    });

    describe('Mijn gegevens', () => {
      it('BSN', async () => {
        await act(() => render(<Component component={MijnGegevensThema} />));
        const bsnField = screen.getByText(
          testState.BRP.content?.persoon.bsn ?? ''
        );
        expect(bsnField).toHaveClass('redacted');
      });

      it('Contactmomenten', async () => {
        await act(() => render(<Component component={MijnGegevensThema} />));

        const toonButton = screen.getByRole('button', {
          name: 'Toon',
        }) as HTMLElement;
        const user = userEvent.setup();
        await user.click(toonButton);

        const contactmomentAfis = screen
          .getByRole('link', {
            name: testState.KLANT_CONTACT.content?.[0].themaKanaal ?? '',
          })
          .closest('tr');
        expect(contactmomentAfis).toHaveClass('redacted');

        const contactmomentVergunning = screen
          .getByText(testState.KLANT_CONTACT.content?.[1].subject ?? '')
          .closest('tr');
        expect(contactmomentVergunning).not.toHaveClass('redacted');
      });
    });
    it('ContactmomentenList', async () => {
      await act(() =>
        render(<Component component={ContactmomentenListPage} />)
      );
      const contactmomentAfis = screen
        .getByRole('link', {
          name: testState.KLANT_CONTACT.content?.[0].themaKanaal ?? '',
        })
        .closest('tr');
      expect(contactmomentAfis).toHaveClass('redacted');

      const contactmomentVergunning = screen
        .getByText(testState.KLANT_CONTACT.content?.[1].subject ?? '')
        .closest('tr');
      expect(contactmomentVergunning).not.toHaveClass('redacted');
    });
  });
});
