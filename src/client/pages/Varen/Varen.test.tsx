import { render } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  VarenFrontend,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
} from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { jsonCopy } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Varen } from './Varen';

type ExploitatieAanvraag = VarenFrontend<VarenVergunningExploitatieType>;
const exploitatieInProgress: ExploitatieAanvraag = {
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
      status: 'Besluit',
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
  status: 'Besluit',
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
      status: 'Besluit',
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

const rederRegistratie: VarenFrontend<VarenRegistratieRederType> = {
  id: '2801937838',
  title: 'Varen registratie reder',
  caseType: 'Varen registratie reder',
  company: 'Balonnenfabriek',
  bsnkvk: '012345678',
  address: 'Amstel 1, 1011 PN Amsterdam',
  postalCode: null,
  city: null,
  phone: '0612345678',
  email: 'myemailadres@example.com',
  dateRequestFormatted: '06 november 2023',
} as unknown as VarenFrontend<VarenRegistratieRederType>;

const varenContent: AppState['VAREN']['content'] = [
  exploitatieInProgress,
  exploitatieDecision,
  rederRegistratie,
];

const getTestState = (content: VarenFrontend[] = varenContent): AppState =>
  jsonCopy({
    VAREN: {
      content: content,
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
      screen.getByText('Meer informatie over passagiers- en beroepsvaart')
    ).toBeInTheDocument();
    expect(screen.getByText('Legestabel')).toBeInTheDocument();
  });

  it('Shows the expected top text', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(
      screen.getByText(
        /De passagiersvaart in Amsterdam is erg populair bij bezoekers/
      )
    ).toBeInTheDocument();
  });

  it('Shows an alert when the reder does not have a registration', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(
      screen.getByText(
        /Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart./
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Naam aanvrager')).toBeNull();
  });

  it('Does not show an alert when the reder has a registration', () => {
    const screen = render(
      <Component state={getTestState([rederRegistratie])} />
    );
    expect(
      screen.queryByText(
        /Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart./
      )
    ).toBeNull();
  });

  it('Shows the reder data', () => {
    const screen = render(
      <Component state={getTestState([rederRegistratie])} />
    );
    expect(screen.getByText('Naam aanvrager')).toBeInTheDocument();
    expect(screen.getByText('Balonnenfabriek')).toBeInTheDocument();

    expect(screen.getByText('Telefoonnummer')).toBeInTheDocument();
    expect(screen.getByText('0612345678')).toBeInTheDocument();

    expect(screen.getByText('KvK nummer')).toBeInTheDocument();
    expect(screen.getByText('012345678')).toBeInTheDocument();

    expect(screen.getByText('Adres')).toBeInTheDocument();
    expect(screen.getByText('Adres')).toBeInTheDocument();

    expect(screen.getByText('E-mailadres')).toBeInTheDocument();
    expect(screen.getByText('myemailadres@example.com')).toBeInTheDocument();

    expect(screen.getByText('Datum registratie')).toBeInTheDocument();
    expect(screen.getByText('06 november 2023')).toBeInTheDocument();
  });

  it('Shows the expected empty tables', () => {
    const screen = render(<Component state={getTestState([])} />);
    expect(screen.getByText('Lopende aanvragen')).toBeInTheDocument();
    expect(screen.getByText('Actieve vergunningen')).toBeInTheDocument();

    expect(
      screen.getByText('U heeft (nog) geen lopende aanvragen')
    ).toBeInTheDocument();

    expect(
      screen.getByText('U heeft (nog) geen actieve vergunningen')
    ).toBeInTheDocument();
  });

  it('Shows the expected rows in the tables', () => {
    const screen = render(<Component state={getTestState()} />);
    expect(screen.getAllByText('Naam vaartuig').length).toBe(2);
    expect(screen.getAllByText('Omschrijving').length).toBe(2);
    expect(screen.getByText('Aangevraagd')).toBeInTheDocument();
    expect(screen.getByText('Datum besluit')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Resultaat')).toBeInTheDocument();

    expect(screen.getAllByText('Varen vergunning exploitatie').length).toBe(2);
    expect(screen.getByText('Titanic')).toBeInTheDocument();
    expect(screen.getByText('In behandeling')).toBeInTheDocument();
    expect(screen.getByText('07 november 2023')).toBeInTheDocument();

    expect(screen.getByText('BootjeVanBerend')).toBeInTheDocument();
    expect(screen.getByText('10 november 2023')).toBeInTheDocument();
    expect(screen.getByText('Verleend')).toBeInTheDocument();
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
