import { screen, render } from '@testing-library/react';
import { generatePath } from 'react-router';

import { themaConfig } from './Horeca-thema-config';
import { HorecaThema } from './HorecaThema';
import { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken';
import { bffApiHost } from '../../../../testing/setup';
import { AppState } from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';

export const DOC_API_PATH =
  '/api/v1/services/decos/documents?id=oP2F-VKO2Z5y9ZJAIjyKseyH-V1K-2hVGrhNehA38i_gG-24x0rQFAf9avn531EgFKea2ULcC-FPBnW25VGYi01c867Jks1tjYkhfXtHt1Q';

export const vergunning: HorecaVergunningFrontend = {
  id: 'Z-24-2238078',
  key: '5E6F10EA670D4D4FA0E637B453D32DAB',
  title: 'Horeca vergunning exploitatie Horecabedrijf',

  caseType: 'Horeca vergunning exploitatie Horecabedrijf',
  decision: null,
  identifier: 'Z/24/2238078',
  processed: false,
  dateDecision: null,
  dateRequest: '2024-12-02T00:00:00',
  dateStart: null,
  dateStartFormatted: null,
  dateEnd: '2025-01-27T00:00:00',
  dateEndFormatted: '27 januari 2025',
  location: 'Amstel 1 A 1011PN',
  dateDecisionFormatted: null,
  dateRequestFormatted: '02 december 2024',
  steps: [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: '2024-12-02T00:00:00',
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: '2024-05-02T22:00:00.000Z',
      description: '',
      documents: [],
      isActive: true,
      isChecked: true,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished: '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
    },
  ],
  displayStatus: 'In behandeling',
  fetchDocumentsUrl: `${bffApiHost}${DOC_API_PATH}`,

  link: {
    to: '/horeca/horeca-vergunning-exploitatie-horecabedrijf/Z-24-2238078',
    title: 'Bekijk hoe het met uw aanvraag staat',
  },
};

const testState = {
  HORECA: {
    content: [vergunning],
    status: 'OK',
  },
} as unknown as AppState;

describe('<Horeca />', () => {
  const routeEntry = generatePath(themaConfig.route.path);
  const routePath = themaConfig.route.path;
  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={HorecaThema}
        state={testState}
      />
    );
  }

  it('Renders the Horeca themapagina', () => {
    render(<Component />);

    expect(
      screen.getByText('Horeca vergunning exploitatie Horecabedrijf')
    ).toBeInTheDocument();
    expect(screen.getByText('In behandeling')).toBeInTheDocument();
    expect(screen.getByText('02 december 2024')).toBeInTheDocument();
    expect(screen.getByText('Huidige vergunningen')).toBeInTheDocument();
    expect(
      screen.getByText('U heeft (nog) geen huidige vergunningen')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Eerdere en niet verleende vergunningen')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'U heeft (nog) geen eerdere en niet verleende vergunningen'
      )
    ).toBeInTheDocument();
  });
});
