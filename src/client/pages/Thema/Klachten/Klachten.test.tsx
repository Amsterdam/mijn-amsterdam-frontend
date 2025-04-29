import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Klachten-thema-config';
import { KlachtenThema } from './KlachtenThema';
import type { AppState } from '../../../../universal/types/App.types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

const testState: Partial<AppState> = {
  KLACHTEN: {
    status: 'OK',
    content: [
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
      },
    ],
  },
};

function initializeState(testState: Partial<AppState>) {
  return (snapshot: MutableSnapshot) =>
    snapshot.set(appStateAtom, testState as AppState);
}

function setupTestComponent(testState: Partial<AppState>) {
  const routeEntry = generatePath(routeConfig.themaPage.path);
  const routePath = routeConfig.themaPage.path;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={KlachtenThema}
        initializeState={initializeState(testState)}
      />
    );
  };
}

describe('<Klachten />', () => {
  it('Matches the Full Page snapshot when there are complaints', () => {
    const Component = setupTestComponent(testState);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when there are no complaints', () => {
    const Component = setupTestComponent({
      KLACHTEN: {
        status: 'OK',
        content: [],
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when API gives no result', () => {
    const Component = setupTestComponent({
      KLACHTEN: {
        status: 'ERROR',
        content: null,
        message: 'Error fetching data',
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
