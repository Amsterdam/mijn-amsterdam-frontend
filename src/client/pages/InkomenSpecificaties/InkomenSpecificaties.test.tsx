import { AppState } from '../../AppState';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import InkomenSpecificaties from './InkomenSpecificaties';
import React from 'react';
import { mount } from 'enzyme';
import { MockAppStateProvider } from '../../AppStateProvider';
import {
  transformFOCUSIncomeSpecificationsData,
  FOCUSIncomeSpecificationSourceData,
} from '../../../server/services';

const sourceData: FOCUSIncomeSpecificationSourceData = {
  content: {
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
  },
  status: 'OK',
};

const content = transformFOCUSIncomeSpecificationsData(sourceData);

const APP_STATE: Partial<AppState> = {
  FOCUS_SPECIFICATIES: { content, status: 'OK' },
};

function mountComponentWithRoute(route: string) {
  return mount(
    <MemoryRouter initialEntries={[route]}>
      <MockAppStateProvider value={APP_STATE}>
        <Switch>
          <Route path="/:type?" component={InkomenSpecificaties} />
        </Switch>
      </MockAppStateProvider>
    </MemoryRouter>
  );
}

describe('<InkomenSpecificaties />', () => {
  it('Renders a list with Uitkeringspecificaties items', () => {
    const component = mountComponentWithRoute('/');
    expect(component.html()).toMatchSnapshot();
  });

  it('Renders a list with Jaaropgaven items', () => {
    const component = mountComponentWithRoute('/jaaropgaven');
    expect(component.html()).toMatchSnapshot();
  });

  it('Allows filtering (search) the results', () => {
    const component = mountComponentWithRoute('/');
    component.find('button.SearchButton').simulate('click');
    expect(component.find('.SearchPanel')).toHaveLength(1);
    component.find('.Select').simulate('change', { target: { value: 'BBS' } });
    expect(component.find('tbody tr')).toHaveLength(1);
    (component.find('DateInput') as any)
      .at(0)
      .props()
      .onChange(new Date('2021-01-01'));
    component.update();
    expect(component.find('table')).toHaveLength(0);
    expect(component.contains('Resetten')).toBe(true);
  });
});
