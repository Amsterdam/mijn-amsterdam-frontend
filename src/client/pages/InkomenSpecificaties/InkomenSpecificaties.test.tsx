import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { transformIncomSpecificationResponse } from '../../../server/services/wpi/api-service';
import { WpiIncomeSpecificationResponseData } from '../../../server/services/wpi/wpi-types';
import { AppRoutes } from '../../../universal/config';
import { dateSort } from '../../../universal/helpers/date';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import InkomenSpecificaties from './InkomenSpecificaties';

const sourceData: WpiIncomeSpecificationResponseData = {
  jaaropgaven: [
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330222',
      title: 'Jaaropgave',
      variant: '',
      url: '/wpi/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021871',
      title: 'Jaaropgave',
      variant: '',
      url: '/wpi/document?id=20021871&isBulk=false&isDms=false',
    },
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330223',
      title: 'Jaaropgave',
      variant: '',
      url: '/wpi/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021872',
      title: 'Jaaropgave',
      variant: '',
      url: '/wpi/document?id=20021871&isBulk=false&isDms=false',
    },
  ],
  uitkeringsspecificaties: [
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267671',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=24267671&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267681',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=24267681&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078481',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=24078481&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078491',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=24078491&isBulk=false&isDms=false',
    },
    {
      datePublished: '2014-01-18T00:00:00+01:00',
      id: '30032581',
      title: 'Uitkeringsspecificatie',
      variant: 'WWB',
      url: '/wpi/document?id=30032581&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569261',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=31569261&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569291',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=31569291&isBulk=false&isDms=false',
    },

    {
      datePublished: '2012-04-19T00:00:00+02:00',
      id: 'x24267671',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=24267671&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-04-19T00:00:00+02:00',
      id: 'x24267681',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=24267681&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-03-23T00:00:00+01:00',
      id: 'x24078481',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=24078481&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-03-23T00:00:00+01:00',
      id: 'x24078491',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=24078491&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-01-18T00:00:00+01:00',
      id: 'x30032581',
      title: 'Uitkeringsspecificatie',
      variant: 'WWB',
      url: '/wpi/document?id=30032581&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-05-18T00:00:00+02:00',
      id: 'x31569261',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: '/wpi/document?id=31569261&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-05-18T00:00:00+02:00',
      id: 'x31569291',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: '/wpi/document?id=31569291&isBulk=false&isDms=false',
    },
  ].sort(dateSort('datePublished', 'desc')),
};

const content = transformIncomSpecificationResponse({
  content: sourceData,
  status: 'OK',
});

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, {
    WPI_SPECIFICATIES: {
      content,
      status: 'OK',
    },
  } as any);
}

describe('<InkomenSpecificaties /> Uitkering', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
    variant: 'uitkering',
  });
  const routePath = AppRoutes['INKOMEN/SPECIFICATIES'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={InkomenSpecificaties}
      initializeState={initializeState}
    />
  );

  beforeAll(() => {
    (window as any).scrollBy = jest.fn();
  });

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Allows filtering (search) the results', () => {
    render(<Component />);

    expect(screen.getByText('18 januari 2014')).toBeInTheDocument();

    userEvent.click(screen.getByText('Zoeken'));

    expect(screen.getByText('Datum van')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2012-01-18')).toBeInTheDocument();

    expect(screen.getByText('Datum t/m')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019-05-18')).toBeInTheDocument();

    expect(
      screen.getByDisplayValue('Alle regelingen (14)')
    ).toBeInTheDocument();

    userEvent.type(screen.getByDisplayValue('2012-01-18'), '2019-03-23');

    expect(screen.getByDisplayValue('2019-03-23')).toBeInTheDocument();
    expect(screen.queryByText('18 januari 2014')).toBeNull();
  });

  it('Has pagination', () => {
    render(<Component />);
    expect(screen.getByText('volgende')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Huidige pagina, pagina 1')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Ga naar pagina 2')).toBeInTheDocument();
    userEvent.click(screen.getByText('volgende'));
    expect(
      screen.getByLabelText('Huidige pagina, pagina 2')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Ga naar pagina 1')).toBeInTheDocument();
    expect(screen.getByText('18 januari 2012')).toBeInTheDocument();
    expect(screen.getByText('vorige')).toBeInTheDocument();
  });
});

describe('<InkomenSpecificaties /> Jaaropgave', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
    variant: 'jaaropgave',
  });
  const routePath = AppRoutes['INKOMEN/SPECIFICATIES'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={InkomenSpecificaties}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
