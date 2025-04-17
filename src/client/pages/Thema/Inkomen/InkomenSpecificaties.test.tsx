import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { describe, expect, it } from 'vitest';

import { listPageParamKind, routes } from './Inkomen-thema-config';
import { InkomenSpecificaties } from './InkomenSpecificaties';
import { transformIncomSpecificationResponse } from '../../../../server/services/wpi/api-service';
import { WpiIncomeSpecificationResponseData } from '../../../../server/services/wpi/wpi-types';
import { dateSort } from '../../../../universal/helpers/date';
import { AppState } from '../../../../universal/types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

vi.mock('../../../../server/helpers/encrypt-decrypt', async (requireActual) => {
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
  uitkeringsspecificaties: Array.from({ length: 30 })
    .map((_x, index) => {
      const datePublished = `2019-04-${(index + 1).toString().padStart(2, '0')}T00:00:00+02:00`;
      return {
        datePublished,
        id: `${index}`,
        title: 'Uitkeringsspecificatie',
        variant: 'Bijzondere Bijstand',
        url: 'http://example.com/wpi/document?id=24267671&isBulk=false&isDms=false',
      };
    })
    .sort(dateSort('datePublished', 'desc')),
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
  const routeEntry = generatePath(routes.listPageSpecificaties, {
    kind: listPageParamKind.uitkering,
  });
  const routePath = routes.listPageSpecificaties;

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

    expect(screen.getByText('29 april 2019')).toBeInTheDocument();

    await user.click(screen.getByText('Zoeken'));

    expect(screen.getByText('Datum van')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019-04-01')).toBeInTheDocument();

    expect(screen.getByText('Datum t/m')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019-04-30')).toBeInTheDocument();

    const input = screen.getByDisplayValue('2019-04-01');
    await user.tripleClick(screen.getByDisplayValue('2019-04-01'));
    await user.keyboard('2019-04-10');

    expect(input).toHaveValue('2019-04-10');
    expect(screen.queryByText('01 april 2019')).toBeNull();
  });

  it('Has pagination', async () => {
    const user = userEvent.setup();
    const screen = render(<Component />);

    expect(screen.getByText('volgende')).toBeInTheDocument();
    expect(screen.getByText('Ga naar pagina 2')).toBeInTheDocument();

    await user.click(screen.getByText('volgende'));

    expect(screen.getByText('Ga naar pagina 1')).toBeInTheDocument();
    expect(screen.getByText('10 april 2019')).toBeInTheDocument();
    expect(screen.getByText('vorige')).toBeInTheDocument();
  });
});

describe('<InkomenSpecificaties /> Jaaropgave', () => {
  const routeEntry = generatePath(routes.listPageSpecificaties, {
    kind: listPageParamKind.jaaropgaven,
  });
  const routePath = routes.listPageSpecificaties;

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
