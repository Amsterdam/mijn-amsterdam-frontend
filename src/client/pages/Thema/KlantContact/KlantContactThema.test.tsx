import { render } from '@testing-library/react';

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

test('Shows max 3 contactmomenten', async () => {
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

  const expectedKanalen: Kanaal[] = [
    'Stadsloket',
    'Telefoon',
    'Chat',
    'Contactformulier',
  ];
  expectedKanalen.forEach((type) => {
    expect(screen.getByText(type)).toBeInTheDocument();
  });

  screen.getByText(noAppointmentsText);
});

test('Shows only afspraken', async () => {
  const afspraakTitle = 'Vaarvignet';
  const state = getState({
    afspraken: new Array(MAX_TABLE_ROWS_ON_THEMA_PAGINA + 1)
      .fill({
        cancellationLink:
          'http://remote-api-host/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        caseReference: '00157784',
        dateFormatted: '26 februari 2026',
        endDate: '2026-02-26T09:20:00Z',
        location: {
          city: null,
          countryCode: 'NL',
          name: 'Zuidoost',
          postalCode: null,
          street: null,
        },
        qrCode: 'xxxxxxxxxxxxxxxxxxxx',
        startDate: '2026-02-26T09:00:00Z',
        status: 'New',
        subject: afspraakTitle,
      })
      .map((a, i) => ({ ...a, caseReference: i })),
  });
  const KlantContactThema = createMijnContactThemaComponent(state);
  const screen = render(<KlantContactThema />);

  expect(screen.queryByText(contactmomentenHeader)).not.toBeInTheDocument();
  expect(screen.queryByText(noAppointmentsText)).not.toBeInTheDocument();

  expect(screen.getAllByText(afspraakTitle)).toHaveLength(
    MAX_TABLE_ROWS_ON_THEMA_PAGINA
  );
  screen.getByRole('link', { name: 'Toon meer' });
});
