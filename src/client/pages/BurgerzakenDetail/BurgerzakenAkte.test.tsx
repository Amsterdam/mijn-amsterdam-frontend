import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import BurgerzakenAkte from './BurgerzakenAkte';

const aktes = [
  {
    registerjaar: '2015',
    aktenummer: '67YUHAK-IO',
    type: 'Huwelijksakte',
    documenten: ['/bla/bla/bla.pdf'],
    id: '70669889',
    link: { to: '/burgerzaken/akte/70669889', title: 'Huwelijksakte' },
    documents: [
      {
        id: 'document-70669889',
        datePublished: '',
        title: 'Huwelijksakte',
        url: '/bla/bla/bla.pdf',
        type: 'pdf',
      },
    ],
  },
];

const testState: any = {
  AKTES: { status: 'OK', content: aktes },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<BurgerzakenAkte />', () => {
  const routeEntry = generatePath(AppRoutes['BURGERZAKEN/AKTE'], {
    id: aktes[0].id,
  });
  const routePath = AppRoutes['BURGERZAKEN/AKTE'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={BurgerzakenAkte}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
