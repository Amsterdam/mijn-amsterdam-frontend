import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Sia from './Sia';

const testState: any = {
  SIA: {
    content: {
      open: {
        items: [
          {
            identifier: 'SIA-09786',
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
          },
        ],
      },
      afgesloten: {
        items: [
          {
            identifier: 'SIA-123123',
            category: 'Bouwwerkzaamheden',
            datePublished: '2021-03-02',
            dateSubject: '2021-03-02',
            dateModified: '2021-03-02',
            dateClosed: '2021-03-02',
            description:
              'Ze zijn al 2 jaar aan het boren, ik ben het spuugzat!',
            status: 'Afgesloten',
            latlon: [52.3717228, 4.8927377],
            email: 'j.vandergroenen@gmail.com',
            phone: '0612312345',
            photos: [],
            latlng: [52.3717228, 4.8927377],
            link: {
              to: '/meldingen/detail/SIA-123123',
              title: 'SIA Melding SIA-123123',
            },
          },
        ],
      },
    },
    status: 'OK',
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Sia />', () => {
  const routeEntry = generatePath(AppRoutes.SIA);
  const routePath = AppRoutes.SIA;

  const Component = ({ init }: { init: typeof initializeState }) => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Sia}
      initializeState={init}
    />
  );

  it('With SIA items', () => {
    render(<Component init={initializeState} />);
    expect(screen.getByText('Meldingen')).toBeInTheDocument();
    expect(screen.getByText('Openstaande meldingen')).toBeInTheDocument();
    expect(screen.getByText('Afgesloten meldingen')).toBeInTheDocument();
    expect(screen.getByText('Fietswrak')).toBeInTheDocument();
    expect(screen.getByText('Bouwwerkzaamheden')).toBeInTheDocument();
  });

  it('Error notification', () => {
    render(
      <Component
        init={(snapshot: MutableSnapshot) => {
          snapshot.set(appStateAtom, {
            SIA: {
              content: null,
              status: 'ERROR',
            },
          } as any);
        }}
      />
    );

    expect(
      screen.getByText('We kunnen op dit moment geen gegevens tonen.')
    ).toBeInTheDocument();
  });

  it('No SIA items', () => {
    render(
      <Component
        init={(snapshot: MutableSnapshot) => {
          snapshot.set(appStateAtom, {
            SIA: {
              content: [],
              status: 'OK',
            },
          } as any);
        }}
      />
    );

    expect(
      screen.getByText('U hebt geen openstaande meldingen.')
    ).toBeInTheDocument();

    expect(
      screen.getByText('U hebt geen afgesloten meldingen.')
    ).toBeInTheDocument();
  });
});
