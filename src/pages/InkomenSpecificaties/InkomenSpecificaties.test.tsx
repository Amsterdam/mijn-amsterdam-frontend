import React from 'react';
import { mount } from 'enzyme';
import InkomenSpecificaties from './InkomenSpecificaties';
import AppState, { AppState as AppStateInterface } from 'AppState';
import {
  FocusInkomenSpecificatie,
  formatIncomeSpecifications,
} from 'data-formatting/focus';
import { MemoryRouter, Switch, Route } from 'react-router-dom';
import { IncomeSpecificationsResponse } from 'hooks/api/api.focus';

const sourceData: IncomeSpecificationsResponse = {
  jaaropgaven: [
    {
      title: 'Jaaropgave',
      type: 'BIBI',
      datePublished: '2016-03-06',
      url: 'focus/document?id=x',
      id: 'item-0',
    },
    {
      title: 'Jaaropgave',
      type: 'BIBI',
      datePublished: '2016-03-06',
      url: 'focus/document?id=x',
      id: 'item-4',
    },
  ],
  uitkeringsspecificaties: [
    {
      title: 'Uitkeringspecificatie',
      type: 'BBS',
      datePublished: '2016-04-06',
      url: 'focus/document?id=x',
      id: 'item-1',
    },
    {
      title: 'Uitkeringspecificatie',
      type: 'STIMREG',
      datePublished: '2016-06-06',
      url: 'focus/document?id=x',
      id: 'item-3',
    },
  ],
};

const data = formatIncomeSpecifications(sourceData);

const APP_STATE = {
  FOCUS_INKOMEN_SPECIFICATIES: {
    data,
    isError: false,
    isLoading: false,
    isPristine: false,
    isDirty: true,
    errorMessage: '',
  },
}; // Add slice of the AppState here

function mountComponentWithRoute(route: string) {
  return mount(
    <MemoryRouter initialEntries={[route]}>
      <AppState value={APP_STATE as AppStateInterface}>
        <Switch>
          <Route path="/:type?" component={InkomenSpecificaties} />
        </Switch>
      </AppState>
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
      .onChange('2021-01-01');
    component.update();
    expect(component.find('table')).toHaveLength(0);
    expect(component.contains('Begin opnieuw')).toBe(true);
  });
});
