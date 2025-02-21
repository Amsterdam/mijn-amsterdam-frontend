import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';

import HLIStadspas from './HLIStadspas';
import { AppState } from '../../../universal/types';
import { componentCreator } from '../MockApp';
import { stadspasCreator } from './test-helpers';
import { AppRoutes } from '../../../universal/config/routes';

const createStadspas = stadspasCreator();
const passNumber = 12345678;

const activePasState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [createStadspas('Kerub', true, passNumber)],
    },
  },
} as unknown as AppState;

const pasBlockedState = {
  HLI: {
    status: 'OK',
    content: {
      regelingen: [],
      stadspas: [createStadspas('Lou', false, passNumber)],
    },
  },
} as unknown as AppState;

const createHLIStadspasComponent = componentCreator({
  component: HLIStadspas,
  routePath: AppRoutes['HLI/STADSPAS'],
  routeEntry: generatePath(AppRoutes['HLI/STADSPAS'], { passNumber }),
});

test('Active pas state', () => {
  const HLIStadspas = createHLIStadspasComponent(activePasState);
  const screen = render(<HLIStadspas />);

  expect(
    screen.getByText(/Hieronder staat het Stadspasnummer van uw actieve pas./)
  ).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
  ).toBeInTheDocument();
});

test('Blocked pas state', () => {
  const HLIStadspas = createHLIStadspasComponent(pasBlockedState);
  const screen = render(<HLIStadspas />);

  expect(
    screen.getByText(
      /Hieronder staat het Stadspasnummer van uw geblokkeerde pas./
    )
  ).toBeInTheDocument();

  expect(
    screen.getByRole('heading', {
      name: 'Deze pas is geblokkeerd, hoe vraag ik een nieuwe aan?',
    })
  ).toBeInTheDocument();
});

test('Modal appears', async () => {
  const HLIStadspas = createHLIStadspasComponent(activePasState);
  const screen = render(<HLIStadspas />);

  const user = userEvent.setup();

  await user.click(
    screen.getByRole('button', { name: 'Blokkeer deze Stadspas' })
  );

  const heading = screen.getByRole('heading', {
    name: 'Weet u zeker dat u uw Stadspas wilt blokkeren?',
  });
  expect(heading).toBeInTheDocument();

  const blockButton = screen.getByRole('button', {
    name: 'Ja, blokkeer mijn pas',
  });
  expect(blockButton).toBeInTheDocument();

  const declineButton = screen.getByRole('button', {
    name: 'Nee, blokkeer mijn pas niet',
  });
  expect(declineButton).toBeInTheDocument();
});
