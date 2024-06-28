import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MutableSnapshot } from 'recoil';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import StatusDetail, { StatusSourceItem } from './StatusDetail';

const testState: any = {
  WPI_TOZO: {
    status: 'OK',
    content: [
      {
        id: 'aanvraag-1',
        title: 'Aanvraag Test item',
        datePublished: '2020-07-24',
        dateStart: '2020-07-14',
        status: 'Besluit',
        about: 'Test item',
        link: {
          to: 'http://some.page/with/path/segments/aanvraag-1',
          title: 'Aanvraag Test item',
        },
        steps: [
          {
            id: 'step1',
            documents: [
              {
                id: 'doc1',
                title: 'Documentje',
                url: '/mijnamsterdamapi/kappie',
              },
            ],
            title: 'aanvraag',
            description: '<p>Uw aanvraag is binngekomen</p>',
            datePublished: '2020-07-24',
            status: 'aanvraag',
            product: 'Test item',
            isActive: true,
            isChecked: true,
            decision: undefined,
          },
          {
            id: 'step2',
            documents: [],
            title: 'inbehandeling',
            description: '<p>Uw aanvraag is in behandeling</p>',
            datePublished: '2020-07-28',
            status: 'inbehandeling',
            product: 'Test item',
            isActive: true,
            isChecked: true,
            decision: undefined,
          },
        ],
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<StatusDetail />', () => {
  const routeEntry = 'http://some.page/with/path/segments/aanvraag-1';
  const routePath = 'http://some.page/with/path/segments/:id';

  it('Matches the Full Status Detail Page snapshot', () => {
    const pageContent = (isLoading: boolean, detailItem: StatusSourceItem) => {
      return (
        <>
          <p>This text will appear. {detailItem.title}</p>
        </>
      );
    };
    function DetailComponent() {
      return (
        <StatusDetail
          thema="INKOMEN"
          stateKey="WPI_TOZO"
          pageContent={pageContent}
          statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
        />
      );
    }

    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={DetailComponent}
        initializeState={initializeState}
      />
    );

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();

    expect(screen.queryByText('Toon alles')).toBeNull();
  });

  it('Matches different config of Full Status Detail Page snapshot', () => {
    function DetailComponent() {
      return (
        <StatusDetail
          thema="INKOMEN"
          stateKey="WPI_TOZO"
          statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
        />
      );
    }

    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={DetailComponent}
        initializeState={initializeState}
      />
    );

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows Unknown item page', () => {
    function DetailComponent() {
      return (
        <StatusDetail
          thema="INKOMEN"
          stateKey="WPI_TOZO"
          statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
        />
      );
    }

    const Component = () => (
      <MockApp
        routeEntry="http://some.page/with/path/segments/aanvraag-2"
        routePath={routePath}
        component={DetailComponent}
        initializeState={initializeState}
      />
    );

    render(<Component />);
    expect(screen.getByText('Detailpagina')).toBeInTheDocument();
    expect(
      screen.getByText('Kies hieronder een van de beschikbare aanvragen.')
    ).toBeInTheDocument();
    expect(screen.getByText('Aanvraag Test item')).toBeInTheDocument();
  });

  it('Reverses the steps', () => {
    function DetailComponent() {
      return (
        <StatusDetail
          thema="INKOMEN"
          stateKey="WPI_TOZO"
          reverseSteps={true}
          statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
        />
      );
    }

    const Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={DetailComponent}
        initializeState={initializeState}
      />
    );

    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
