import { render } from '@testing-library/react';

import { themaConfig } from './KlantContact-thema-config.ts';
import { KlantContactThema } from './KlantContactThema.tsx';
import type { AfspraakFrontend } from '../../../../server/services/klantcontact/klantcontact.types.ts';
import { bffApi } from '../../../../testing/utils.ts';
import type { AppState } from '../../../../universal/types/App.types.ts';
import { componentCreator } from '../../MockApp.tsx';

const createMijnContactThemaComponent = componentCreator({
  component: KlantContactThema,
  routePath: themaConfig.route.path,
  routeEntry: themaConfig.route.path,
});

function getState(content: {
  afspraken?: AfspraakFrontend[];
  contactmomenten?: Array<Record<string, unknown>>;
  communicatievoorkeuren?: Record<string, unknown> | null;
  failedDependencies?: Record<
    string,
    { status: 'ERROR'; message: string; content: null }
  >;
}): AppState {
  if (!content.afspraken) {
    content.afspraken = [];
  }
  if (!content.contactmomenten) {
    content.contactmomenten = [];
  }
  return {
    KLANT_CONTACT: {
      status: 'OK',
      content: {
        afspraken: content.afspraken,
        contactmomenten: content.contactmomenten,
        communicatievoorkeuren: content.communicatievoorkeuren ?? null,
      },
      failedDependencies: content.failedDependencies,
    },
  } as unknown as AppState;
}

describe('KlantContactThema', () => {
  beforeEach(() => {
    // Keep request mocking in place for this suite; component itself is state-driven.
    bffApi.post(/\/user-feedback\/collect.*/).reply(200, {
      status: 'OK',
      content: null,
    });
  });

  test('shows afspraken section when afspraken exist', async () => {
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
      afspraken: [afspraak],
    });
    const KlantContactThema = createMijnContactThemaComponent(state);
    const screen = render(<KlantContactThema />);

    expect(
      screen.getByRole('heading', { name: 'Afspraken bij een stadsloket' })
    ).toBeInTheDocument();
    expect(screen.getByText(afspraakTitle)).toBeInTheDocument();
  });

  test('shows communicatievoorkeuren section when communicatievoorkeuren exist', async () => {
    const state = getState({
      communicatievoorkeuren: {
        standaardContactgegevens: {
          Email: {
            id: 'email-1',
            type: 'Email',
            value: 'test@example.com',
            isVerified: true,
            dateModified: '2026-06-01T12:00:00.000Z',
            dateModifiedFormatted: '1 juni 2026',
          },
        },
        aangeslotenDiensten: [
          {
            id: 'dienst-1',
            beschrijving: 'Belastingen',
          },
        ],
      },
    });

    const KlantContactThema = createMijnContactThemaComponent(state);
    const screen = render(<KlantContactThema />);

    expect(
      screen.getByRole('heading', { name: 'Post per e-mail' })
    ).toBeInTheDocument();
    expect(screen.getByText('Belastingen')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mijn contactgegevens' })
    ).toBeInTheDocument();
  });

  test('shows partial error for failed dependencies', async () => {
    const state = getState({
      afspraken: [],
      contactmomenten: [],
      communicatievoorkeuren: null,
      failedDependencies: {
        afspraken: {
          status: 'ERROR',
          message: 'Afspraken dependency failed',
          content: null,
        },
        communicatievoorkeuren: {
          status: 'ERROR',
          message: 'Communicatievoorkeuren dependency failed',
          content: null,
        },
      },
    });

    const KlantContactThema = createMijnContactThemaComponent(state);
    const screen = render(<KlantContactThema />);

    const errorSection = screen
      .getByRole('heading', { name: 'Foutmelding' })
      .closest('section');

    expect(errorSection).not.toBeNull();
    expect(errorSection).toHaveTextContent(
      'Wij kunnen de volgende gegevens nu niet tonen:'
    );
    expect(errorSection).toHaveTextContent('- Uw overzicht van afspraken');
    expect(errorSection).toHaveTextContent(
      '- Uw overzicht van communicatievoorkeuren'
    );
  });
});
