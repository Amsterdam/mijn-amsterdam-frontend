import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { themaConfig } from './Bodem-thema-config';
import { BodemDetail } from './BodemDetail';
import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { AppState } from '../../../../universal/types/App.types';
import { componentCreator } from '../../MockApp';

const metingen: LoodMetingFrontend[] = [
  {
    processed: false,
    adres: 'Schipluidenlaan 12A',
    datumAanvraag: '2022-12-01T09:53:11Z',
    datumAanvraagFormatted: '2022-12-01T09:53:11Z',
    decision: null,
    displayStatus: 'Ontvangen',
    identifier: 'OL-000001',
    aanvraagNummer: 'AV-001447',
    rapportBeschikbaar: false,
    redenAfwijzing: '',
    link: {
      to: '/lood-meting/OL-000001',
      title: 'Bekijk loodmeting',
    },
    document: null,
    steps: [
      {
        status: 'Ontvangen',
        id: '1',
        datePublished: '2022-12-01T09:53:11Z',
        isActive: true,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '2',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
      {
        status: 'Afgehandeld',
        id: '3',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ],
    datumInbehandeling: null,
    datumAfgehandeld: null,
    datumAfgehandeldFormatted: null,
    rapportId: null,
    id: 'OL-000001',
    title: 'OL-000001',
  },
  {
    processed: true,
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-29T09:54:22Z',
    datumAanvraagFormatted: '29 november 2022',
    datumInbehandeling: '2022-11-29T09:54:44Z',
    datumAfgehandeld: '2022-12-15T08:52:00Z',
    datumAfgehandeldFormatted: '15 december 2022',
    decision: 'Afgewezen',
    displayStatus: 'Afgewezen',
    identifier: 'OL-000001',
    aanvraagNummer: 'AV-001446',
    rapportBeschikbaar: false,
    rapportId: '6ec7efd6-cb6f-ed11-9561-0022489fda17',
    redenAfwijzing: 'Tuin bij een bedrijfsobject',
    link: {
      to: '/lood-meting/OL-000001',
      title: 'Bekijk loodmeting',
    },
    document: null,
    steps: [
      {
        status: 'Ontvangen',
        id: '1',
        datePublished: '2022-11-29T09:53:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '2',
        datePublished: '2022-11-29T09:54:44Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        id: '3',
        datePublished: '2022-12-15',
        isActive: true,
        isChecked: true,
      },
    ],
    id: 'OL-000001',
    title: 'OL-000001',
  },
  {
    processed: true,
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-28T12:14:55Z',
    datumAanvraagFormatted: '28 november 2022',
    datumInbehandeling: '2022-11-28T12:24:20Z',
    datumAfgehandeld: '2022-11-28T13:53:42Z',
    datumAfgehandeldFormatted: '28 november 2022',
    decision: 'Afgehandeld',
    displayStatus: 'Afgehandeld',
    identifier: 'OL-000001',
    aanvraagNummer: 'AV-001444',
    rapportBeschikbaar: true,
    rapportId: '87464b90-176f-ed11-9561-0022489fdff7',
    redenAfwijzing: '',
    link: {
      to: '/lood-meting/OL-000001',
      title: 'Bekijk loodmeting',
    },
    document: {
      title: 'Rapport Lood in de bodem-check',
      id: '87464b90-176f-ed11-9561-0022489fdff7',
      url: 'http://localhost:5000/api/v1/services/lood/87464b90-176f-ed11-9561-0022489fdff7/attachments',
      datePublished: '2022-11-28T13:53:42Z',
    },
    steps: [
      {
        status: 'Ontvangen',
        id: '1',
        datePublished: '2022-11-28T12:14:55Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '2',
        datePublished: '2022-11-28T09:54:44Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        id: '3',
        datePublished: '2022-11-28T13:53:42Z',
        isActive: true,
        isChecked: true,
      },
    ],
    id: 'OL-000001',
    title: 'OL-000001',
  },
];

const [metingOntvangen, metingAfgewezen, metingAfgehandeld] = metingen;

const createLoodMeting = componentCreator({
  component: BodemDetail,
  routeEntry: generatePath(themaConfig.detailPage.route.path, {
    id: 'OL-000001',
  }),
  routePath: themaConfig.detailPage.route.path,
});
const createComponentMetingen = (metingen: LoodMetingFrontend[]) =>
  createLoodMeting({
    BODEM: {
      content: metingen,
      status: 'OK',
    },
  } as unknown as AppState);

describe('LoodMeting', () => {
  describe('with results', () => {
    it('should show the correct detailpage for status in Ontvangen', async () => {
      const Component = createComponentMetingen([metingOntvangen]);
      const screen = render(<Component />);

      const locatie = screen.getByText('Locatie');
      expect(locatie).toBeInTheDocument();
      expect(locatie.nextElementSibling).toHaveTextContent(
        metingOntvangen.adres
      );

      const statusOntvangen = screen.getByText('Ontvangen');
      expect(statusOntvangen).toBeInTheDocument();
      expect(statusOntvangen.firstElementChild).toHaveAttribute(
        'aria-label',
        'Huidige status'
      );

      const resultaat = screen.queryByText('Resultaat');
      expect(resultaat).not.toBeInTheDocument();
    });

    it('should show the correct detailpage for status afgewezen', async () => {
      const Component = createComponentMetingen([metingAfgewezen]);
      const screen = render(<Component />);

      const locatie = screen.getByText('Locatie');
      expect(locatie).toBeInTheDocument();
      expect(locatie.nextElementSibling).toHaveTextContent(
        metingAfgewezen.adres
      );

      const statusAfgehandeld = screen.getByText('Afgehandeld');
      expect(statusAfgehandeld).toBeInTheDocument();
      expect(statusAfgehandeld.firstElementChild).toHaveAttribute(
        'aria-label',
        'Huidige status'
      );

      const redenAfwijzing = screen.getByText('Reden afwijzing');
      expect(redenAfwijzing).toBeInTheDocument();
      expect(redenAfwijzing.nextElementSibling).toHaveTextContent(
        'Tuin bij een bedrijfsobject'
      );
    });

    it('should show the correct detailpage for status afgehandeld', async () => {
      const Component = createComponentMetingen([metingAfgehandeld]);
      const screen = render(<Component />);

      const locatie = screen.getByText('Locatie');
      expect(locatie).toBeInTheDocument();
      expect(locatie.nextElementSibling).toHaveTextContent(
        metingAfgehandeld.adres
      );

      const resultaat = screen.queryByText('Resultaat');
      expect(resultaat).not.toBeInTheDocument();

      const statusAfgehandeld = screen.getByText('Afgehandeld');
      expect(statusAfgehandeld).toBeInTheDocument();
      expect(statusAfgehandeld.firstElementChild).toHaveAttribute(
        'aria-label',
        'Huidige status'
      );
    });
  });

  describe('without results', () => {
    const Component = createComponentMetingen([]);

    it('should show the error message', async () => {
      const screen = render(<Component />);

      const errorMessage = screen.getByRole('heading', {
        level: 4,
        name: 'Geen gegevens gevonden',
      });
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
