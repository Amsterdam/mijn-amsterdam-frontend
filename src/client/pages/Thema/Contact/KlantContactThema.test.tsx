import { render } from '@testing-library/react';

import { themaConfig } from './Contact-thema-config.ts';
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

const state = {
  KLANT_CONTACT: {
    content: { contactmomenten, afspraken: [] },
  },
} as unknown as AppState;

test('Shows max 3 contactmomenten', async () => {
  const Component = createMijnContactThemaComponent(state);
  const screen = render(<Component />);
  expect(screen.getByText('Contactmomenten')).toBeInTheDocument();

  const expectedContacttypes: ContactType[] = [
    'Stadsloket',
    'Telefoon',
    'Chat',
    'Contactformulier',
  ];
  expectedContacttypes.forEach((type) => {
    expect(screen.getByText(type)).toBeInTheDocument();
  });
});
