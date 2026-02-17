import { render, within } from '@testing-library/react';
import { generatePath } from 'react-router';

import { themaConfig } from './Jeugd-thema-config';
import { JeugdDetail } from './JeugdDetail';
import { AppState } from '../../../../universal/types/App.types';
import { componentCreator } from '../../MockApp';

const id = '1610585298';

const besluitGenomenState: AppState['JEUGD'] = {
  content: [
    {
      id,
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
  ],
  status: 'OK',
};

const basicAppState = {
  JEUGD: besluitGenomenState,
} as AppState;

const createComponent = componentCreator({
  component: JeugdDetail,
  routeEntry: generatePath(themaConfig.detailPage.route.path, { id }),
  routePath: themaConfig.detailPage.route.path,
});

test('Static elements', async () => {
  const Component = createComponent(basicAppState);
  const screen = render(<Component />);

  screen.getByRole('heading', { name: 'Aangepast groepsvervoer' });

  const resultaatElement = screen.getByText('Resultaat');
  expect(resultaatElement.nextElementSibling!).toHaveTextContent('Toegewezen');

  const table = within(screen.getByRole('table'));
  const brievenElement = table.getByText('Brieven');
  within(brievenElement.nextElementSibling as HTMLElement).queryByRole('link', {
    name: 'Besluit: toekenning Leerlingenvervoer (AV)',
  });
  table.getByText('Verzenddatum');
  table.getByText('07 april 2025');

  const statusTreinHeader = screen.getByRole('heading', { name: 'Status' });
  assert(
    statusTreinHeader.parentElement?.parentElement,
    'The <div> Container should be here'
  );
  const statusTreinContainer = within(
    statusTreinHeader.parentElement.parentElement
  );
  statusTreinContainer.getByRole('heading', { name: /Aanvraag ontvangen/ });
  statusTreinContainer.getByRole('heading', { name: /In behandeling/ });
  statusTreinContainer.getByRole('heading', { name: /Besluit genomen/ });
  statusTreinContainer.getByRole('heading', { name: /Einde recht/ });
});
