import { render } from '@testing-library/react';

import { routeConfig } from './Klachten-thema-config';
import { KlachtenThema } from './KlachtenThema';
import { KlachtFrontend } from '../../../../server/services/klachten/types';
import type { AppState } from '../../../../universal/types/App.types';
import { componentCreator } from '../../MockApp';

const activeKlachten = [
  {
    gewensteOplossing: null,
    inbehandelingSinds: '2022-05-30T00:00:00.000Z',
    locatie: null,
    omschrijving: 'Dit is de omschrijving van de klacht',
    onderwerp: 'Test voor decentrale toewijzing',
    ontvangstDatum: '2022-05-30T00:00:00.000Z',
    ontvangstDatumFormatted: '05 mei 2022',
    id: '36049',
    title: 'Klacht 36049',
    displayStatus: 'Ontvangen',
    steps: [],
    link: {
      title: 'Klacht 36049',
      to: '/klachten/klacht/36049',
    },
    isActive: true,
  },
  {
    gewensteOplossing: null,
    inbehandelingSinds: '2022-05-18T00:00:00.000Z',
    locatie: null,
    omschrijving: 'Dear Amsterdam Municipality',
    onderwerp: null,
    ontvangstDatum: '2022-05-05T00:00:00.000Z',
    ontvangstDatumFormatted: '05 mei 2022',
    id: '36046',
    title: 'Klacht 36046',
    displayStatus: 'Ontvangen',
    steps: [],
    link: {
      title: 'Klacht 36046',
      to: '/klachten/klacht/36046',
    },
    isActive: true,
  },
] as unknown as KlachtFrontend[];

const inactiveKlachten = [
  {
    gewensteOplossing: null,
    inbehandelingSinds: '2022-05-18T00:00:00.000Z',
    locatie: null,
    omschrijving: 'Dear Amsterdam Municipality',
    onderwerp: null,
    ontvangstDatum: '2022-05-05T00:00:00.000Z',
    ontvangstDatumFormatted: '05 mei 2022',
    id: '37049',
    title: 'Klacht 37049',
    displayStatus: 'Afgehandeld',
    steps: [],
    link: {
      title: 'Klacht 37049',
      to: '/klachten/klacht/37049',
    },
    isActive: false,
  },
  {
    gewensteOplossing: null,
    inbehandelingSinds: '2022-05-18T00:00:00.000Z',
    locatie: null,
    omschrijving: 'Dear Amsterdam Municipality',
    onderwerp: null,
    ontvangstDatum: '2022-05-05T00:00:00.000Z',
    ontvangstDatumFormatted: '05 mei 2022',
    id: '36086',
    title: 'Klacht 36089',
    displayStatus: 'Afgehandeld',
    steps: [],
    link: {
      title: 'Klacht 36089',
      to: '/klachten/klacht/36089',
    },
    isActive: false,
  },
] as unknown as KlachtFrontend[];

function getState(klachten: KlachtFrontend[]): Partial<AppState> {
  const testState: Partial<AppState> = {
    KLACHTEN: {
      status: 'OK',
      content: klachten,
    },
  };
  return testState;
}

const createKlachtenComponent = componentCreator({
  component: KlachtenThema,
  routePath: routeConfig.themaPage.path,
  routeEntry: routeConfig.themaPage.path,
});

describe('<Klachten />', () => {
  test('Active and inactive complaints', () => {
    const testState = getState([...activeKlachten, ...inactiveKlachten]);
    const Component = createKlachtenComponent(testState);
    const screen = render(<Component />);

    screen.getByText('Openstaande klachten');
    screen.getByText('Afgehandelde klachten');

    testState.KLACHTEN?.content?.forEach((klacht) => {
      screen.getByText(klacht.id);
    });
  });

  test('Only active complaints', () => {
    const testState = getState(activeKlachten);
    const Component = createKlachtenComponent(testState);
    const screen = render(<Component />);

    screen.getByText('Openstaande klachten');
    inactiveKlachten.forEach((klacht) => {
      expect(screen.queryByText(klacht.id)).not.toBeInTheDocument();
    });

    screen.getByText('U heeft (nog) geen afgehandelde klachten');
  });

  test('Only finished complaints', () => {
    const testState = getState(inactiveKlachten);
    const Component = createKlachtenComponent(testState);
    const screen = render(<Component />);

    screen.getByText('U heeft (nog) geen openstaande klachten');

    screen.getByText('Afgehandelde klachten');
    activeKlachten.forEach((klacht) => {
      expect(screen.queryByText(klacht.id)).not.toBeInTheDocument();
    });
  });

  test('No complaints', () => {
    const Component = createKlachtenComponent({
      KLACHTEN: {
        status: 'OK',
        content: [],
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('API Error', () => {
    const Component = createKlachtenComponent({
      KLACHTEN: {
        status: 'ERROR',
        content: null,
        message: 'Error fetching data',
      },
    });
    const screen = render(<Component />);
    screen.getByText('Foutmelding');
    screen.getByText(/We kunnen op dit moment niet alle gegevens tonen/);
  });
});
