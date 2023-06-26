import { render, screen, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import SiaDetail from './SiaDetail';
import nock from 'nock';
import { PLACEHOLDER_IMAGE_URL } from '../../config/app';

const SIA_ITEM = {
  id: 'xbcdefgh',
  identifier: 'SIG-12420',
  category: 'Overlast in de openbare ruimte',
  datePublished: '2023-03-30T14:07:49.344646+02:00',
  dateModified: '2023-03-30T14:07:50.171638+02:00',
  dateClosed: '',
  dateIncidentStart: '2023-03-30T14:07:48+02:00',
  dateIncidentEnd: null,
  status: 'Open',
  description: 'Er ligt een oude fiets in de straat!!!',
  address: 'Dingermans 73\n1053XX Amsterdam',
  latlon: { lat: 52.4, lng: 4.9 },
  email: 'dingermans@amsterdam.nl',
  phone: '065656565656',
  hasAttachments: true,
  link: { to: '/meldingen/detail/SIG-12420', title: 'SIA Melding SIG-12420' },
};

const testState: any = {
  SIA: {
    status: 'OK',
    content: { open: { items: [SIA_ITEM] }, afgesloten: { items: [] } },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<SiaDetail />', () => {
  (window as any).scrollTo = jest.fn();

  beforeAll(() => {
    // Disable real http requests.
    // All requests should be mocked.
    nock.disableNetConnect();
  });

  let historyFetch: nock.Scope | null = null;
  let attachmentsFetch: nock.Scope | null = null;

  beforeEach(() => {
    attachmentsFetch = nock('http://localhost')
      .get('/api/v1/services/signals/xbcdefgh/attachments')
      .reply(200, {
        content: [
          {
            url: PLACEHOLDER_IMAGE_URL,
            isImage: true,
          },
        ],
        status: 'OK',
      });

    historyFetch = nock('http://localhost')
      .get('/api/v1/services/signals/xbcdefgh/history')
      .reply(200, {
        content: [
          {
            status: 'Open',
            key: 'UPDATE_STATUS',
            datePublished: '2023-03-30T14:07:49.400270+02:00',
            description: '',
          },
          {
            status: 'Reactie verzonden',
            key: 'REACTIE_VERZONDEN',
            datePublished: '2023-03-31T14:07:49.400270+02:00',
            description: '',
          },
        ],
        status: 'OK',
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  const routeEntry = generatePath(AppRoutes['SIA/DETAIL/OPEN'], {
    id: SIA_ITEM.identifier,
  });

  const routePath = AppRoutes['SIA/DETAIL/OPEN'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={SiaDetail}
      initializeState={initializeState}
    />
  );

  test('Happy view', async () => {
    render(<Component />);

    await waitFor(() => {
      return expect([
        historyFetch?.isDone(),
        attachmentsFetch?.isDone(),
      ]).toStrictEqual([true, true]);
    });

    console.log('hoi!!!', historyFetch?.isDone(), attachmentsFetch?.isDone());

    await new Promise(process.nextTick);

    expect(screen.getByText('Meldingen')).toBeInTheDocument();
    expect(
      screen.getByText(`Meldingsnummer ${SIA_ITEM.identifier}`)
    ).toBeInTheDocument();
    expect(screen.getByText(SIA_ITEM.email)).toBeInTheDocument();
    expect(screen.getByText(SIA_ITEM.phone)).toBeInTheDocument();
    expect(screen.getAllByText(SIA_ITEM.status)).toHaveLength(2); // one in body, one in status line
    expect(screen.getByText(SIA_ITEM.description)).toBeInTheDocument();
    expect(screen.queryByText(SIA_ITEM.category)).not.toBeInTheDocument();
    expect(screen.getByText(`Foto's`)).toBeInTheDocument();
    expect(screen.getByText(`Reactie verzonden`)).toBeInTheDocument();
  });
});
