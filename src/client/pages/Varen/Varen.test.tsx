import { render, within } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  VarenZakenFrontend,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
} from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { jsonCopy } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Varen } from './Varen';

type ExploitatieAanvraag = VarenZakenFrontend<VarenVergunningExploitatieType>;
const exploitatieInProgress = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  status: 'In behandeling',
  decision: null,
  processed: false,
  vesselName: 'Titanic',
  dateRequestFormatted: '07 november 2023',
  steps: [
    {
      status: 'Ontvangen',
      datePublished: '2023-11-07T00:00:00',
      description: '',
      isActive: false,
      isChecked: true,
      id: 'step-0',
    },
    {
      status: 'In behandeling',
      datePublished: '2023-11-08T00:00:00',
      description: '',
      isActive: true,
      isChecked: false,
      id: 'step-1',
    },
    {
      status: 'Afgehandeld',
      datePublished: '2023-11-09T00:00:00',
      isActive: false,
      isChecked: false,
      id: 'step-2',
    },
  ],
  link: {
    to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-24-0000001',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
} as unknown as ExploitatieAanvraag;

const exploitatieDecision: ExploitatieAanvraag = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  status: 'Afgehandeld',
  decision: 'Verleend',
  processed: true,
  vesselName: 'BootjeVanBerend',
  dateRequestFormatted: '08 november 2023',
  dateDecisionFormatted: '10 november 2023',
  steps: [
    {
      status: 'Ontvangen',
      datePublished: '2023-11-08T00:00:00',
      description: '',
      isActive: false,
      isChecked: true,
      id: 'step-0',
    },
    {
      status: 'In behandeling',
      datePublished: '2023-11-09T00:00:00',
      description: '',
      isActive: false,
      isChecked: true,
      id: 'step-1',
    },
    {
      status: 'Afgehandeld',
      datePublished: '2023-11-10T00:00:00',
      isActive: true,
      isChecked: false,
      id: 'step-2',
    },
  ],
  link: {
    to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-24-0000001',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
} as unknown as ExploitatieAanvraag;

const rederRegistratie = {
  id: '2801937838',
  title: 'Varen registratie reder',
  caseType: 'Varen registratie reder',
  company: 'Balonnenfabriek',
  bsnkvk: '012345678',
  address: 'Amstel 1, 1011 PN Amsterdam',
  correspondenceAddress: 'Correspondence 1, 1011 PN Amsterdam',
  postalCode: null,
  city: null,
  phone: '0612345678',
  email: 'myemailadres@example.com',
  dateRequest: '2023-11-06T00:00:00',
  dateRequestFormatted: '06 november 2023',
} as unknown as VarenRegistratieRederType;

const varenContent = [exploitatieInProgress, exploitatieDecision];

const getTestState = (
  zaken: VarenZakenFrontend[] = varenContent,
  reder: VarenRegistratieRederType | null = rederRegistratie
): AppState =>
  jsonCopy({
    VAREN: {
      content: {
        reder,
        zaken,
      },
      status: 'OK',
    },
  });

function initializeState(snapshot: MutableSnapshot, state: AppState) {
  snapshot.set(appStateAtom, state);
}

const routePath = AppRoutes.VAREN;
const routeEntry = generatePath(AppRoutes.VAREN);

describe('<Varen />', () => {
  function Component({ state }: { state: AppState }) {
    return (
      <MockApp
        routePath={routePath}
        routeEntry={routeEntry}
        component={Varen}
        initializeState={(snap) => initializeState(snap, state)}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2025-03-04');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Shows the expected title on the page', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Passagiers- en beroepsvaart'
    );
  });

  it('Shows the expected links', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(
      screen.getByRole('link', {
        name: 'Meer informatie over passagiers- en beroepsvaart',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Legestabel',
      })
    ).toBeInTheDocument();
  });

  it('Shows the expected top text', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(
      screen.getByText(
        /De passagiersvaart in Amsterdam is erg populair bij bezoekers/
      )
    ).toBeInTheDocument();
  });

  describe('Reder registratie', () => {
    const alertRegexNoRederRegistratie =
      /Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart./;

    it('Shows an alert when the reder does not have a registration', () => {
      const screen = render(<Component state={getTestState([], null)} />);
      expect(
        screen.getByText(alertRegexNoRederRegistratie)
      ).toBeInTheDocument();
      expect(screen.queryByText('Naam aanvrager')).toBeNull();
    });

    it('Does not show an alert when the reder has a registration', () => {
      const screen = render(<Component state={getTestState([])} />);
      expect(screen.queryByText(alertRegexNoRederRegistratie)).toBeNull();
    });

    it('Shows the reder data', () => {
      const screen = render(<Component state={getTestState([])} />);

      const gegevensAanvragerTitle = screen.getByText('Gegevens Aanvrager');
      expect(gegevensAanvragerTitle).toBeInTheDocument();

      const naamAanvrager = screen.getByText('Naam aanvrager');
      expect(naamAanvrager.nextElementSibling).toHaveTextContent(
        'Balonnenfabriek'
      );

      const telefoonnummer = screen.getByText('Telefoonnummer');
      expect(telefoonnummer.nextElementSibling).toHaveTextContent('0612345678');

      const bsnKvk = screen.getByText('KvK nummer');
      expect(bsnKvk).toBeInTheDocument();
      expect(bsnKvk.nextElementSibling).toHaveTextContent('012345678');

      const adres = screen.getByText('Adres');
      expect(adres.nextElementSibling).toHaveTextContent(
        'Correspondence 1, 1011 PN Amsterdam'
      );

      const email = screen.getByText('E-mailadres');
      expect(email.nextElementSibling).toHaveTextContent(
        'myemailadres@example.com'
      );

      const datumRegistratie = screen.getByText('Datum registratie');
      expect(datumRegistratie.nextElementSibling).toHaveTextContent(
        '06 november 2023'
      );
    });
  });

  it('Shows the reder data without a correspondence address', () => {
    const screen = render(
      <Component
        state={getTestState([], {
          ...rederRegistratie,
          correspondenceAddress: null,
        })}
      />
    );

    const adres = screen.getByText('Adres');
    expect(adres.nextElementSibling).toHaveTextContent(
      'Amstel 1, 1011 PN Amsterdam'
    );
  });

  describe('Tables', () => {
    it('Shows the expected empty tables', () => {
      const screen = render(<Component state={getTestState([])} />);

      const lopendeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Lopende aanvragen',
      });
      expect(lopendeAanvraagTableHeader).toBeInTheDocument();
      const lopendeAanvraagTableNoContent = screen.getByText(
        'U heeft (nog) geen lopende aanvragen'
      );
      expect(lopendeAanvraagTableHeader.parentNode).toContainElement(
        lopendeAanvraagTableNoContent
      );

      const actieveVergunningenTableHeader = screen.getByRole('heading', {
        name: 'Actieve vergunningen',
      });
      expect(actieveVergunningenTableHeader).toBeInTheDocument();
      const actieveVergunningTableNoContent = screen.getByText(
        'U heeft (nog) geen actieve vergunningen'
      );
      expect(actieveVergunningenTableHeader.parentNode).toContainElement(
        actieveVergunningTableNoContent
      );
    });

    it('Shows the expected rows in the tables', () => {
      const screen = render(<Component state={getTestState()} />);

      const lopendeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Lopende aanvragen',
      });
      const lopendeAanvraagTable = within(
        within(lopendeAanvraagTableHeader.parentElement!).getByRole('table')
      );

      const lopendeAanvraagColumnHeaders =
        lopendeAanvraagTable.getAllByRole('columnheader');
      expect(
        lopendeAanvraagColumnHeaders.map((h) => h.textContent)
      ).toMatchObject([
        'Naam vaartuig',
        'Omschrijving',
        'Aangevraagd',
        'Status',
      ]);
      expect(lopendeAanvraagTable.getByText('Titanic')).toBeDefined();
      expect(
        lopendeAanvraagTable.getByText('Varen vergunning exploitatie')
      ).toBeDefined();
      expect(lopendeAanvraagTable.getByText('In behandeling')).toBeDefined();
      expect(lopendeAanvraagTable.getByText('07 november 2023')).toBeDefined();

      const actieveVergunningTableHeader = screen.getByRole('heading', {
        name: 'Actieve vergunningen',
      });
      const actieveVergunningTable = within(
        within(actieveVergunningTableHeader.parentElement!).getByRole('table')
      );

      const actieveVergunningenColumnHeaders =
        actieveVergunningTable.getAllByRole('columnheader');
      expect(
        actieveVergunningenColumnHeaders.map((h) => h.textContent)
      ).toMatchObject([
        'Naam vaartuig',
        'Omschrijving',
        'Datum besluit',
        'Resultaat',
      ]);

      expect(actieveVergunningTable.getByText('BootjeVanBerend')).toBeDefined();
      expect(
        actieveVergunningTable.getByText('Varen vergunning exploitatie')
      ).toBeDefined();
      expect(
        actieveVergunningTable.getByText('10 november 2023')
      ).toBeDefined();
      expect(actieveVergunningTable.getByText('Verleend')).toBeDefined();
    });
  });

  it('Naam vaartuig links to the corresponding aanvraag or vergunning', () => {
    const screen = render(
      <Component state={getTestState([exploitatieDecision])} />
    );

    expect(screen.getByText('BootjeVanBerend').getAttribute('href')).toContain(
      'Z-24-0000001'
    );
  });

  it('Shows the expected number of vergunningen and the link to the listpage', () => {
    const screen = render(
      <Component
        state={getTestState(
          [
            exploitatieDecision,
            exploitatieDecision,
            exploitatieDecision,
            exploitatieDecision,
          ].map((vergunning, index) => ({ ...vergunning, id: `${index}` }))
        )}
      />
    );
    expect(screen.getAllByText('Varen vergunning exploitatie').length).toBe(3);
    expect(screen.getByText('Alle actieve vergunningen')).toBeInTheDocument();
  });
});
