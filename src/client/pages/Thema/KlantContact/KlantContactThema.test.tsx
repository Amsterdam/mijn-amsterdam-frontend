import { render } from '@testing-library/react';

import { themaConfig } from './KlantContact-thema-config.ts';
import { KlantContactThema } from './KlantContactThema.tsx';
import type {
  ContactType,
  ContactmomentFrontend,
} from '../../../../server/services/salesforce/klantcontact.types.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import { componentCreator } from '../../MockApp.tsx';

const createMijnContactThemaComponent = componentCreator({
  component: KlantContactThema,
  routePath: themaConfig.route.path,
  routeEntry: themaConfig.route.path,
});

const contactmomenten: ContactmomentFrontend[] = [
  {
    datePublished: '2024-05-29 08:02:38',
    datePublishedFormatted: '2024-05-29 08:02:38',
    subject: 'Meldingen',
    referenceNumber: '00002032',
    contacttype: 'Stadsloket',
  },
  {
    datePublished: '2024-05-29 08:02:38',
    datePublishedFormatted: '2024-05-29 08:02:38',
    subject: 'Meldingen',
    referenceNumber: '00002032',
    contacttype: 'Telefoon',
  },
  {
    datePublished: '2024-05-29 08:02:38',
    datePublishedFormatted: '2024-05-29 08:02:38',
    subject: 'Meldingen',
    referenceNumber: '00002032',
    contacttype: 'Chat',
  },
  {
    datePublished: '2024-05-29 08:02:38',
    datePublishedFormatted: '2024-05-29 08:02:38',
    subject: 'Meldingen',
    referenceNumber: '00002032',
    contacttype: 'Contactformulier',
  },
];

const onlyContactmomentenState = {
  KLANT_CONTACT: {
    content: { contactmomenten, afspraken: [] },
  },
} as unknown as AppState;

const afspraakTitle = 'Vaarvignet';

const onlyAfsprakenState = {
  KLANT_CONTACT: {
    content: {
      contactmomenten: [],
      afspraken: [
        {
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
          status: 'Canceled',
          subject: afspraakTitle,
        },
      ],
    },
  },
} as unknown as AppState;

const contactmomentenHeader = 'Contactmomenten';
const noAppointmentsText = /U heeft geen afspraken/;

test('Shows max 3 contactmomenten', async () => {
  const Component = createMijnContactThemaComponent(onlyContactmomentenState);
  const screen = render(<Component />);
  expect(screen.getByText(contactmomentenHeader)).toBeInTheDocument();

  const expectedContacttypes: ContactType[] = [
    'Stadsloket',
    'Telefoon',
    'Chat',
    'Contactformulier',
  ];
  expectedContacttypes.forEach((type) => {
    expect(screen.getByText(type)).toBeInTheDocument();
  });

  screen.getByText(noAppointmentsText);
});

test('Shows only afspraken', async () => {
  const Component = createMijnContactThemaComponent(onlyAfsprakenState);
  const screen = render(<Component />);

  screen.getByText(afspraakTitle);
  expect(screen.queryByText(contactmomentenHeader)).not.toBeInTheDocument();
  expect(screen.queryByText(noAppointmentsText)).not.toBeInTheDocument();
});
