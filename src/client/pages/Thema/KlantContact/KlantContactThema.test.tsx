import { render, within } from '@testing-library/react';

import { themaConfig } from './KlantContact-thema-config.ts';
import { KlantContactThema } from './KlantContactThema.tsx';
import type {
  Kanaal,
  ContactmomentFrontend,
  AfspraakFrontend,
} from '../../../../server/services/klantcontact/klantcontact.types.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app.ts';
import { componentCreator } from '../../MockApp.tsx';

const createMijnContactThemaComponent = componentCreator({
  component: KlantContactThema,
  routePath: themaConfig.route.path,
  routeEntry: themaConfig.route.path,
});

function getState(content: {
  afspraken?: AfspraakFrontend[];
  contactmomenten?: ContactmomentFrontend[];
}): AppState {
  if (!content.afspraken) {
    content.afspraken = [];
  }
  if (!content.contactmomenten) {
    content.contactmomenten = [];
  }
  return {
    KLANT_CONTACT: {
      content,
    },
  } as unknown as AppState;
}

const contactmomentenHeader = 'Contactmomenten';
const noAppointmentsText = /U heeft geen afspraken/;

test('Shows contactmomenten', async () => {
  const state = getState({
    contactmomenten: [
      {
        datePublished: '2024-05-29 08:02:38',
        datePublishedFormatted: '2024-05-29 08:02:38',
        subject: 'Meldingen',
        referenceNumber: '00002032',
        kanaal: 'Stadsloket',
      },
      {
        datePublished: '2024-05-29 08:02:38',
        datePublishedFormatted: '2024-05-29 08:02:38',
        subject: 'Meldingen',
        referenceNumber: '00002032',
        kanaal: 'Telefoon',
      },
      {
        datePublished: '2024-05-29 08:02:38',
        datePublishedFormatted: '2024-05-29 08:02:38',
        subject: 'Meldingen',
        referenceNumber: '00002032',
        kanaal: 'Chat',
      },
      {
        datePublished: '2024-05-29 08:02:38',
        datePublishedFormatted: '2024-05-29 08:02:38',
        subject: 'Meldingen',
        referenceNumber: '00002032',
        kanaal: 'Contactformulier',
      },
    ],
  });
  const KlantContactThema = createMijnContactThemaComponent(state);
  const screen = render(<KlantContactThema />);
  expect(screen.getByText(contactmomentenHeader)).toBeInTheDocument();

  const table = screen.getByRole('table');
  const expectedKanalen: Kanaal[] = [
    'Stadsloket',
    'Telefoon',
    'Chat',
    'Contactformulier',
  ];
  expectedKanalen.forEach((kanaal) => {
    expect(within(table).getByText(kanaal)).toBeInTheDocument();
  });

  screen.getByText(noAppointmentsText);
});

test('Shows afspraken and empty contactmomenten', async () => {
  const afspraakTitle = 'Vaarvignet';
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
    subject: afspraakTitle,
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
  const state = getState({
    afspraken: new Array(MAX_TABLE_ROWS_ON_THEMA_PAGINA + 1)
      .fill(afspraak)
      .map((a, i) => ({ ...a, caseReference: i })),
  });
  const KlantContactThema = createMijnContactThemaComponent(state);
  const screen = render(<KlantContactThema />);

  expect(screen.getByText(contactmomentenHeader)).toBeInTheDocument();
  expect(
    screen.getByText('U heeft (nog) geen contactmomenten')
  ).toBeInTheDocument();
  expect(screen.queryByText(noAppointmentsText)).not.toBeInTheDocument();

  expect(screen.getAllByText(afspraakTitle)).toHaveLength(
    MAX_TABLE_ROWS_ON_THEMA_PAGINA
  );
  screen.getByRole('link', { name: 'Toon meer' });
});
