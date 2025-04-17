import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../../universal/config/routes';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';
import { KlachtenThemaPagina } from './Klachten';

const testState: any = {
  KLACHTEN: {
    status: 'OK',
    content: {
      klachten: [
        {
          gewensteOplossing: null,
          inbehandelingSinds: '2022-05-30T00:00:00.000Z',
          locatie: null,
          omschrijving: 'Dit is de omschrijving van de klacht',
          onderwerp: 'Test voor decentrale toewijzing',
          ontvangstDatum: '2022-05-30T00:00:00.000Z',
          id: '36049',
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
          id: '36046',
          link: {
            title: 'Klacht 36046',
            to: '/klachten/klacht/36046',
          },
        },
      ],
      aantal: 2,
    },
  },
};

function initializeState(testState: any) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

function setupTestComponent(testState: any) {
  const routeEntry = generatePath(AppRoutes.KLACHTEN);
  const routePath = AppRoutes.KLACHTEN;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={KlachtenThemaPagina}
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
        content: {
          klachten: [],
          aantal: 0,
        },
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
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
