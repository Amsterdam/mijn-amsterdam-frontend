import type { ComponentType } from '@react-spring/web';
import { render, screen } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { describe, it } from 'vitest';

import type {
  KlantcontactResponseData,
  Kanaal,
  ContactmomentFrontend,
} from '../../server/services/klantcontact/klantcontact.types.ts';
import type { AppState } from '../../universal/types/App.types.ts';
import { DashboardRoute } from '../pages/Dashboard/Dashboard-routes.ts';
import { Dashboard } from '../pages/Dashboard/Dashboard.tsx';
import { MockApp } from '../pages/MockApp.tsx';
import { MyNotificationsPage } from '../pages/MyNotifications/MyNotifications.tsx';
import { themaConfig as themaConfigAfis } from '../pages/Thema/Afis/Afis-thema-config.ts';
import { themaConfig as themaConfigBezwaren } from '../pages/Thema/Bezwaren/Bezwaren-thema-config.ts';
import { BezwarenDetail } from '../pages/Thema/Bezwaren/BezwarenDetail.tsx';
import { BezwarenList } from '../pages/Thema/Bezwaren/BezwarenList.tsx';
import { BezwarenThema } from '../pages/Thema/Bezwaren/BezwarenThema.tsx';
import { ContactmomentenListPage } from '../pages/Thema/KlantContact/ContactmomentenListPage.tsx';
import { KlantContactThema } from '../pages/Thema/KlantContact/KlantContactThema.tsx';
import { MijnGegevensThema } from '../pages/Thema/Profile/private/ProfilePrivate.tsx';
import { themaConfig as themaVergunningen } from '../pages/Thema/Vergunningen/Vergunningen-thema-config.ts';

const testState = {
  KLANT_CONTACT: {
    status: 'OK',
    content: {
      contactmomenten: [
        {
          subject: 'Financiën',
          kanaal: themaConfigAfis.title as Kanaal, // We misuse this to keep things together
        },
        {
          subject: themaVergunningen.id,
          kanaal: 'Chat',
        },
      ] as ContactmomentFrontend[],
      afspraken: [],
    } satisfies KlantcontactResponseData,
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
        title: `Notification ${themaConfigBezwaren.title}`,
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: themaConfigBezwaren.id,
        themaTitle: themaConfigBezwaren.title,
        link: {
          to: '/item-1',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not2',
        title: `Notification ${themaVergunningen.title}`,
        description: 'Notificatie2',
        datePublished: '2021-07-24',
        themaID: themaVergunningen.id,
        themaTitle: themaVergunningen.title,
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
      it('<MyThemasPanel />', () => {
        render(<Component component={Dashboard} />);
        expect(screen.getByTestId(themaConfigBezwaren.title)).toHaveClass(
          'redacted'
        );
        expect(screen.getByTestId(themaVergunningen.title)).not.toHaveClass(
          'redacted'
        );
      });

      it('Notifications', () => {
        render(<Component component={Dashboard} />);
        const listItems = screen.getAllByRole('listitem');
        const redactedNotification = listItems.find((li) =>
          li.textContent?.includes(themaConfigBezwaren.title)
        );
        expect(redactedNotification).toHaveClass('redacted');
        const nonRedactedNotification = listItems.find((li) =>
          li.textContent?.includes(themaVergunningen.title)
        );
        expect(nonRedactedNotification).not.toHaveClass('redacted');
      });
    });

    it('Notifications', () => {
      render(<Component component={MyNotificationsPage} />);
      const listItems = screen.getAllByRole('listitem');
      const redactedNotification = listItems.find((li) =>
        li.textContent?.includes(themaConfigBezwaren.title)
      );
      expect(redactedNotification).toHaveClass('redacted');
      const nonRedactedNotification = listItems.find((li) =>
        li.textContent?.includes(themaVergunningen.title)
      );
      expect(nonRedactedNotification).not.toHaveClass('redacted');
    });

    test.each([
      ['Thema', BezwarenThema],
      ['ThemaDetail', BezwarenDetail],
      ['ThemaList', BezwarenList],
    ])('%s', (_, component) => {
      render(<Component component={component} />);
      const cobrowseElem = document.querySelector(
        '.mams-content-wrapper.redacted'
      ) as HTMLElement;
      expect(cobrowseElem).toBeInTheDocument();

      // Make sure the redacted is on the correct element and redacts the page content
      const cobrowseElemText = cobrowseElem?.innerText;
      const textOnlyInElem = themaConfigBezwaren.title;
      expect(cobrowseElemText).toContain(textOnlyInElem);

      const fullDocumentText = document.body.innerText;
      const outsideCobrowseElemText = fullDocumentText.replace(
        cobrowseElemText,
        ''
      );
      expect(outsideCobrowseElemText).not.toContain(textOnlyInElem);
    });

    describe('Mijn gegevens', () => {
      it('BSN', () => {
        render(<Component component={MijnGegevensThema} />);
        const bsnField = screen.getByText(
          testState.BRP.content?.persoon.bsn ?? ''
        );
        expect(bsnField).toHaveClass('redacted');
      });

      it('Contactmomenten', () => {
        render(<Component component={KlantContactThema} />);

        const contactmomentAfis = screen
          .getByRole('link', {
            name:
              testState.KLANT_CONTACT.content?.contactmomenten[0].kanaal ?? '',
          })
          .closest('tr');
        expect(contactmomentAfis).toHaveClass('redacted');

        const contactmomentVergunning = screen
          .getByText(
            testState.KLANT_CONTACT.content?.contactmomenten[1].subject ?? ''
          )
          .closest('tr');
        expect(contactmomentVergunning).not.toHaveClass('redacted');
      });
    });

    it('ContactmomentenList', () => {
      render(<Component component={ContactmomentenListPage} />);
      const contactmomentAfis = screen
        .getByRole('link', {
          name:
            testState.KLANT_CONTACT.content?.contactmomenten[0].kanaal ?? '',
        })
        .closest('tr');
      expect(contactmomentAfis).toHaveClass('redacted');

      const contactmomentVergunning = screen
        .getByText(
          testState.KLANT_CONTACT.content?.contactmomenten[1].subject ?? ''
        )
        .closest('tr');
      expect(contactmomentVergunning).not.toHaveClass('redacted');
    });
  });
});
