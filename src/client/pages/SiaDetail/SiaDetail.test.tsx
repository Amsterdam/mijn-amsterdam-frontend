import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import SiaDetail from './SiaDetail';

const SIA_ITEM_ID = 'SIA-09786';
const SIA_ITEM = {
  identifier: SIA_ITEM_ID,
  category: 'Fietswrak',
  datePublished: '2021-03-02',
  dateSubject: '2021-03-02',
  dateModified: '2021-03-02',
  dateClosed: '2021-03-02',
  description:
    'Er staat een fiets al meer dan een jaar op deze plek, met lekke banden etc.',
  status: 'Gemeld',
  latlon: [52.3717228, 4.8927377],
  email: 'j.vandergroenen@gmail.com',
  phone: '0612312345',
  photos: [
    'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
    'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
  ],
  latlng: [52.3717228, 4.8927377],
  link: {
    to: '/meldingen/detail/SIA-09786',
    title: 'SIA Melding SIA-09786',
  },
};
const testState: any = {
  SIA: {
    status: 'OK',
    content: [SIA_ITEM],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<SiaDetail />', () => {
  const routeEntry = generatePath(AppRoutes['SIA/DETAIL'], {
    id: SIA_ITEM_ID,
  });

  const routePath = AppRoutes['SIA/DETAIL'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={SiaDetail}
      initializeState={initializeState}
    />
  );

  it('Happy view', () => {
    render(<Component />);
    expect(screen.getByText('Meldingen')).toBeInTheDocument();
    expect(
      screen.getByText(`Meldingsnummer ${SIA_ITEM_ID}`)
    ).toBeInTheDocument();
    expect(screen.getByText(SIA_ITEM.email)).toBeInTheDocument();
    expect(screen.getByText(SIA_ITEM.phone)).toBeInTheDocument();
    expect(screen.getAllByText(SIA_ITEM.status)).toHaveLength(2); // one in body, one in status line
    expect(screen.getByText(SIA_ITEM.description)).toBeInTheDocument();
    expect(screen.getByText(SIA_ITEM.category)).toBeInTheDocument();
  });
});
