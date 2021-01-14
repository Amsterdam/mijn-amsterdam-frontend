import { render, screen } from '@testing-library/react';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';
import footer from './amsterdam-nl-footer-data.json';
import MainFooter from './MainFooter';

jest.mock('../../hooks/media.hook');

const testState: any = {
  CMS_CONTENT: { status: 'OK', content: { footer } },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<MainFooter />', () => {
  const routeEntry = generatePath(AppRoutes.ROOT);
  const routePath = AppRoutes.ROOT;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={MainFooter}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Uit in Amsterdam')).toBeInTheDocument();
    expect(screen.getByText('Volg de gemeente')).toBeInTheDocument();
  });
});
