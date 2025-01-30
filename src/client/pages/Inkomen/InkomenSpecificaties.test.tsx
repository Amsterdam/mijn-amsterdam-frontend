import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { describe, expect, it } from 'vitest';

import { transformIncomSpecificationResponse } from '../../../server/services/wpi/api-service';
import { WpiIncomeSpecificationResponseData } from '../../../server/services/wpi/wpi-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { AppState } from '../../../universal/types';
import { appStateAtom } from '../../hooks/useAppState';
import { InkomenSpecificaties } from '../Inkomen/InkomenSpecificaties';
import MockApp from '../MockApp';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: () => {
      return 'test-encrypted-id';
    },
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

const sourceData: WpiIncomeSpecificationResponseData = {
  jaaropgaven: [
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330222',
      title: 'Jaaropgave',
      variant: '',
      url: 'http://example.com/wpi/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021871',
      title: 'Jaaropgave',
      variant: '',
      url: 'http://example.com/wpi/document?id=20021871&isBulk=false&isDms=false',
    },
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330223',
      title: 'Jaaropgave',
      variant: '',
      url: 'http://example.com/wpi/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021872',
      title: 'Jaaropgave',
      variant: '',
      url: 'http://example.com/wpi/document?id=20021871&isBulk=false&isDms=false',
    },
  ],
  uitkeringsspecificaties: [
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267671',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=24267671&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267681',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=24267681&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078481',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=24078481&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078491',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=24078491&isBulk=false&isDms=false',
    },
    {
      datePublished: '2014-01-18T00:00:00+01:00',
      id: '30032581',
      title: 'Uitkeringsspecificatie',
      variant: 'WWB',
      url: 'http://example.com/wpi/document?id=30032581&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569261',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=31569261&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569291',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=31569291&isBulk=false&isDms=false',
    },

    {
      datePublished: '2012-04-19T00:00:00+02:00',
      id: 'x24267671',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=24267671&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-04-19T00:00:00+02:00',
      id: 'x24267681',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=24267681&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-03-23T00:00:00+01:00',
      id: 'x24078481',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=24078481&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-03-23T00:00:00+01:00',
      id: 'x24078491',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=24078491&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-01-18T00:00:00+01:00',
      id: 'x30032581',
      title: 'Uitkeringsspecificatie',
      variant: 'WWB',
      url: 'http://example.com/wpi/document?id=30032581&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-05-18T00:00:00+02:00',
      id: 'x31569261',
      title: 'Uitkeringsspecificatie',
      variant: 'Participatiewet',
      url: 'http://example.com/wpi/document?id=31569261&isBulk=false&isDms=false',
    },
    {
      datePublished: '2012-05-18T00:00:00+02:00',
      id: 'x31569291',
      title: 'Uitkeringsspecificatie',
      variant: 'Bijzondere Bijstand',
      url: 'http://example.com/wpi/document?id=31569291&isBulk=false&isDms=false',
    },
  ].sort(dateSort('datePublished', 'desc')),
};

const content = transformIncomSpecificationResponse('xxxxxxxxxxxxxxxxxxxxx', {
  content: sourceData,
  status: 'OK',
});

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, {
    WPI_SPECIFICATIES: {
      content,
      status: 'OK',
    },
  } as unknown as AppState);
}

describe('<InkomenSpecificaties /> Uitkering', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
    kind: 'uitkering',
  });
  const routePath = AppRoutes['INKOMEN/SPECIFICATIES'];

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={InkomenSpecificaties}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Allows filtering (search) the results', async () => {
    const user = userEvent.setup();
    const screen = render(<Component />);

    expect(screen.getByText('18 januari 2014')).toBeInTheDocument();

    await user.click(screen.getByText('Zoeken'));

    expect(screen.getByText('Datum van')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2012-01-18')).toBeInTheDocument();

    expect(screen.getByText('Datum t/m')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019-05-18')).toBeInTheDocument();

    expect(
      screen.getByDisplayValue('Alle regelingen (14)')
    ).toBeInTheDocument();

    const input = screen.getByDisplayValue('2012-01-18');
    await user.tripleClick(screen.getByDisplayValue('2012-01-18'));
    await user.keyboard('2019-03-23');

    expect(input).toHaveValue('2019-03-23');
    expect(screen.queryByText('18 januari 2014')).toBeNull();
  });

  it('Has pagination', async () => {
    const user = userEvent.setup();
    const screen = render(<Component />);

    expect(screen.getByText('volgende')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Huidige pagina, pagina 1')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Ga naar pagina 2')).toBeInTheDocument();

    await user.click(screen.getByText('volgende'));

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
    kind: 'jaaropgave',
  });
  const routePath = AppRoutes['INKOMEN/SPECIFICATIES'];

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={InkomenSpecificaties}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});
