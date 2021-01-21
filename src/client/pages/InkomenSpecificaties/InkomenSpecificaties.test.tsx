import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import InkomenSpecificaties from './InkomenSpecificaties';
import {
  FOCUSIncomeSpecificationSourceDataContent,
  transformFOCUSIncomeSpecificationsData,
} from '../../../server/services';
import userEvent from '@testing-library/user-event';

const sourceData = {
  jaaropgaven: [
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330222',
      title: 'Jaaropgave',
      type: '',
      url: 'focus/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021871',
      title: 'Jaaropgave',
      type: '',
      url: 'focus/document?id=20021871&isBulk=false&isDms=false',
    },
    {
      datePublished: '2011-01-28T00:00:00+01:00',
      id: '95330223',
      title: 'Jaaropgave',
      type: '',
      url: 'focus/document?id=95330222&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-01-04T00:00:00+01:00',
      id: '20021872',
      title: 'Jaaropgave',
      type: '',
      url: 'focus/document?id=20021871&isBulk=false&isDms=false',
    },
  ],
  uitkeringsspecificaties: [
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267671',
      title: 'Uitkeringsspecificatie',
      type: 'Bijzondere Bijstand',
      url: 'focus/document?id=24267671&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-04-19T00:00:00+02:00',
      id: '24267681',
      title: 'Uitkeringsspecificatie',
      type: 'Participatiewet',
      url: 'focus/document?id=24267681&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078481',
      title: 'Uitkeringsspecificatie',
      type: 'Participatiewet',
      url: 'focus/document?id=24078481&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-03-23T00:00:00+01:00',
      id: '24078491',
      title: 'Uitkeringsspecificatie',
      type: 'Bijzondere Bijstand',
      url: 'focus/document?id=24078491&isBulk=false&isDms=false',
    },
    {
      datePublished: '2014-01-18T00:00:00+01:00',
      id: '30032581',
      title: 'Uitkeringsspecificatie',
      type: 'WWB',
      url: 'focus/document?id=30032581&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569261',
      title: 'Uitkeringsspecificatie',
      type: 'Participatiewet',
      url: 'focus/document?id=31569261&isBulk=false&isDms=false',
    },
    {
      datePublished: '2019-05-18T00:00:00+02:00',
      id: '31569291',
      title: 'Uitkeringsspecificatie',
      type: 'Bijzondere Bijstand',
      url: 'focus/document?id=31569291&isBulk=false&isDms=false',
    },
  ],
};

const content = transformFOCUSIncomeSpecificationsData(
  sourceData as FOCUSIncomeSpecificationSourceDataContent
);

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, {
    FOCUS_SPECIFICATIES: {
      content,
      status: 'OK',
    },
  } as any);
}

describe('<InkomenSpecificaties /> Uitkeringsspecificaties', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
    category: 'uitkeringsspecificaties',
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

  it('Allows filtering (search) the results', () => {
    const { getByText, getByDisplayValue, queryByText } = render(<Component />);

    expect(getByText('18 januari 2014')).toBeInTheDocument();

    userEvent.click(getByText('Zoeken'));

    expect(getByText('Datum van')).toBeInTheDocument();
    expect(getByDisplayValue('2014-01-18')).toBeInTheDocument();

    expect(getByText('Datum t/m')).toBeInTheDocument();
    expect(getByDisplayValue('2019-05-18')).toBeInTheDocument();

    expect(getByDisplayValue('Alle regelingen (7)')).toBeInTheDocument();

    userEvent.type(getByDisplayValue('2014-01-18'), '2019-03-23');

    expect(getByDisplayValue('2019-03-23')).toBeInTheDocument();
    expect(queryByText('18 januari 2014')).toBeNull();
  });
});

describe('<InkomenSpecificaties /> Jaaropgaven', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
    category: 'jaaropgaven',
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
