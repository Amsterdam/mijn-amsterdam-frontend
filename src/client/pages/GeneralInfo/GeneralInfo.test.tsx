import { render } from '@testing-library/react';

import { componentCreator } from '../MockApp.tsx';
import { GeneralInfoRoute } from './GeneralInfo-routes.ts';
import { GeneralInfo } from './GeneralInfo.tsx';
import type { AppState } from '../../../universal/types/App.types.ts';
import { themaTitle } from '../../components/MyArea/MyArea-thema-config.ts';
import { stadspasTitle } from '../Thema/HLI/HLI-thema-config.ts';

const createGeneralInfoComponent = componentCreator({
  component: GeneralInfo,
  routeEntry: GeneralInfoRoute.route,
  routePath: GeneralInfoRoute.route,
});

// TODO: https://gemeente-amsterdam.atlassian.net/browse/MIJN-12053
describe.skip('<GeneralInfo />', () => {
  test('Always show MyArea as having `to` in sectionProps makes it show as a link.', () => {
    const Component = createGeneralInfoComponent({} as unknown as AppState);
    const screen = render(<Component />);

    const pasElement = screen.getByText(themaTitle);
    expect(pasElement).toHaveAttribute('href');
  });

  test('Clickable link when thema is active', () => {
    const Component = createGeneralInfoComponent({
      HLI: {
        status: 'OK',
        content: {
          regelingen: [1],
          stadspas: [],
        },
      },
    } as unknown as AppState);
    const screen = render(<Component />);

    const pasElement = screen.getByText(stadspasTitle);
    expect(pasElement).toHaveAttribute('href');
  });

  test('Not clickable when not active', () => {
    const Component = createGeneralInfoComponent({
      HLI: {
        status: 'OK',
        content: {
          regelingen: [],
          stadspas: [],
        },
      },
    } as unknown as AppState);
    const screen = render(<Component />);

    const pasElement = screen.getByText(stadspasTitle);
    expect(pasElement).not.toHaveAttribute('href');
  });
});
