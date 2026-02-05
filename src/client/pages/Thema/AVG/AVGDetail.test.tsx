import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

//import { routeConfig } from './AVG-thema-config';
import { themaConfig } from './AVG-thema-config';
import { AVGDetail } from './AVGDetail';
import { AVGRequestFrontend } from '../../../../server/services/avg/types';
import {
  AppState,
  StatusLineItem,
} from '../../../../universal/types/App.types';
import MockApp from '../../MockApp';

const steps: StatusLineItem[] = [
  {
    id: 'item-1',
    status: 'Ontvangen',
    datePublished: '2023-03-18T00:00:00.000Z',
    description: '',
    documents: [],
    isActive: false,
    isChecked: true,
  },
  {
    id: 'item-3',
    status: 'In behandeling',
    datePublished: '2023-05-30T00:00:00.000Z',
    description: '',
    documents: [],
    isActive: false,
    isChecked: true,
  },
  {
    id: 'item-2',
    status: 'Extra informatie nodig',
    datePublished: '2023-06-03T00:00:00.000Z',
    description:
      'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief waarin staat welke informatie wij nodig hebben.',
    documents: [],
    isActive: true,
    isChecked: true,
  },
  {
    id: 'last-item',
    status: 'Afgehandeld',
    datePublished: '',
    description: '',
    documents: [],
    isActive: false,
    isChecked: false,
  },
];

const verzoeken: AVGRequestFrontend[] = [
  {
    id: '1',
    title: 'AVG verzoek 1',
    displayStatus: 'Open',
    registratieDatum: '',
    type: 'Inzage',
    themas: 'Parkeren, Foo, Bar',
    resultaat: '',
    ontvangstDatum: '2023-03-06T00:00:00.000Z',
    ontvangstDatumFormatted: '06 maart 2023',
    opschortenGestartOp: '2023-03-16T00:00:00.000Z',
    datumInBehandeling: '',
    datumAfhandeling: '',
    steps,
    link: {
      to: '/avg/verzoek/1',
      title: 'AVG verzoek 1',
    },
    toelichting: '',
  },
  {
    id: '223',
    title: 'AVG verzoek 223',
    displayStatus: 'Afgehandeld',
    registratieDatum: '16-03-2023 14:37',
    type: 'Verwijderen gegevens',
    themas: 'Vergunningen, Enzo',
    resultaat: '',
    ontvangstDatum: '2022-03-09T00:00:00.000Z',
    ontvangstDatumFormatted: '09 maart 2022',
    opschortenGestartOp: '',
    datumInBehandeling: '2023-03-16T00:00:00.000Z',
    datumAfhandeling: '2023-03-19T00:00:00.000Z',
    steps,
    link: {
      to: '/avg/verzoek/223',
      title: 'AVG verzoek 223',
    },
    toelichting: '',
  },
];

export const testState = {
  AVG: {
    status: 'OK',
    content: {
      verzoeken,
      aantal: 2,
    },
  },
} as unknown as AppState;

function setupTestComponent(id: string) {
  const routeEntry = generatePath(themaConfig.detailPage.route.path, {
    id,
  });
  const routePath = themaConfig.detailPage.route.path;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={AVGDetail}
        state={testState}
      />
    );
  };
}

describe('AVGDetail', () => {
  describe('No result', () => {
    const Component = setupTestComponent('abc');

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('With result', () => {
    const Component = setupTestComponent('223');

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
