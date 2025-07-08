import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { routeConfig } from './Jeugd-thema-config.ts';
import { JeugdThemaPagina } from './JeugdThema.tsx';
import { AppState } from '../../../../universal/types/App.types.ts';
import { expectTableHeaders } from '../../../helpers/test-utils.ts';
import { componentCreator } from '../../MockApp.tsx';

const jeugdState: AppState['JEUGD'] = {
  content: [
    {
      id: '1610585298',
      title: 'Aangepast groepsvervoer',
      isActual: true,
      link: {
        title: 'Meer informatie',
        to: '/jeugd/voorziening/1610585298',
      },
      steps: [
        {
          id: 'status-step-0',
          status: 'Aanvraag ontvangen',
          description: '<p>Uw aanvraag is ontvangen.</p>',
          datePublished: '',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-1',
          status: 'In behandeling',
          description: '<p>Uw aanvraag is in behandeling.</p>',
          datePublished: '2025-03-27',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-3',
          status: 'Besluit genomen',
          description:
            '<p>U krijgt aangepast groepsvervoer per 01 april 2025.</p>\n      <p>In de brief leest u meer over dit besluit. De brief staat bovenaan deze pagina.</p>\n      ',
          datePublished: '2025-04-07T09:44:48.697',
          isActive: true,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-4',
          status: 'Einde recht',
          description:
            '<p>Als uw recht op aangepast groepsvervoer stopt, krijgt u hiervan bericht.</p>\n    ',
          datePublished: '',
          isActive: false,
          isChecked: false,
          isVisible: true,
          documents: [],
        },
      ],
      itemTypeCode: 'LLV',
      decision: 'Toegewezen',
      dateDecision: '2025-04-07T09:44:48.697',
      dateDecisionFormatted: '07 april 2025',
      documents: [
        {
          id: 'B3392456',
          title: 'Besluit: toekenning Leerlingenvervoer (AV)',
          url: 'http://localhost:5000/api/v1/services/wmo/document/tvpdkMcqT0DFLNMyvMGXDFrbgIuYbhgI7xI3Xq9heMTDHx77cPWUujYTNjMAI1k3_vV44ChFWUYKII1XLeKeVA',
          datePublished: '2025-04-07T09:44:48.697',
        },
      ],
      displayStatus: 'Besluit genomen',
      statusDate: '2025-04-07T09:44:48.697',
      statusDateFormatted: '07 april 2025',
    },
    {
      id: '2735835706',
      title: 'Openbaar vervoer abonnement',
      isActual: true,
      link: {
        title: 'Meer informatie',
        to: '/jeugd/voorziening/2735835706',
      },
      steps: [
        {
          id: 'status-step-0',
          status: 'Aanvraag ontvangen',
          description: '<p>Uw aanvraag is ontvangen.</p>',
          datePublished: '',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-1',
          status: 'In behandeling',
          description: '<p>Uw aanvraag is in behandeling.</p>',
          datePublished: '2025-02-20',
          isActive: true,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-3',
          status: 'Besluit genomen',
          description: '',
          datePublished: '',
          isActive: false,
          isChecked: false,
          isVisible: true,
          documents: [],
        },
      ],
      itemTypeCode: 'LLV',
      decision: '',
      dateDecision: '',
      dateDecisionFormatted: '',
      documents: [],
      displayStatus: 'In behandeling',
      statusDate: '2025-02-20',
      statusDateFormatted: '20 februari 2025',
    },
    {
      id: '232024340',
      title: 'Aangepast groepsvervoer',
      isActual: false,
      link: {
        title: 'Meer informatie',
        to: '/jeugd/voorziening/232024340',
      },
      steps: [
        {
          id: 'status-step-0',
          status: 'Aanvraag ontvangen',
          description: '<p>Uw aanvraag is ontvangen.</p>',
          datePublished: '',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-1',
          status: 'In behandeling',
          description: '<p>Uw aanvraag is in behandeling.</p>',
          datePublished: '2019-07-12',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-3',
          status: 'Besluit genomen',
          description:
            '<p>U krijgt aangepast groepsvervoer per 26 augustus 2019.</p>\n      <p>In de brief leest u meer over dit besluit. De brief is per post naar u verstuurd.</p>\n      ',
          datePublished: '2019-07-12',
          isActive: false,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
        {
          id: 'status-step-4',
          status: 'Einde recht',
          description:
            '<p>Uw recht op aangepast groepsvervoer is beëindigd per 03 juli 2020.</p>\n    ',
          datePublished: '2020-07-03',
          isActive: true,
          isChecked: true,
          isVisible: true,
          documents: [],
        },
      ],
      itemTypeCode: 'LLV',
      decision: 'Toegewezen',
      dateDecision: '2019-07-12',
      dateDecisionFormatted: '12 juli 2019',
      documents: [],
      displayStatus: 'Einde recht',
      statusDate: '2020-07-03',
      statusDateFormatted: '03 juli 2020',
    },
  ],
  status: 'OK',
};

const basicAppState = {
  JEUGD: jeugdState,
} as AppState;

const createComponent = componentCreator({
  component: JeugdThemaPagina,
  routeEntry: generatePath(routeConfig.themaPage.path),
  routePath: generatePath(routeConfig.themaPage.path),
});

test('Static elements', async () => {
  const Component = createComponent(basicAppState);
  const screen = render(<Component />);
  screen.getByRole('heading', { name: 'Onderwijs en Jeugd' });
  screen.getByText(/Bel dan gratis de Wmo Helpdesk/);

  // Finds phonenumber
  screen.getAllByText(/\d{4} \d{4}/);

  const mustHaveHeaders = ['Voorziening', 'Status', 'Datum'];

  expectTableHeaders(screen, 'Huidige voorzieningen', mustHaveHeaders);
  expectTableHeaders(
    screen,
    'Eerdere en afgewezen voorzieningen',
    mustHaveHeaders
  );

  screen.getByText(/U ziet hier informatie vanaf.+Bel dan de Wmo Helpdesk.*/);
});
