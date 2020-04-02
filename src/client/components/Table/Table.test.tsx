import React from 'react';
import { shallow } from 'enzyme';
import Table from './Table';

const items = [
  {
    title: 'Title 1',
    date: '2019-08-06',
  },
  {
    title: 'Foo the world',
    date: '2013-08-06',
  },
];

describe('<Table />', () => {
  it('Renders the default', () => {
    expect(shallow(<Table items={items} />).html()).toMatchSnapshot();
  });

  it('Uses a different title key', () => {
    const nItems = [...items].map(({ title, ...item }) => {
      return {
        ...item,
        name: title,
      };
    });
    expect(
      shallow(<Table titleKey="name" items={nItems} />).html()
    ).toMatchSnapshot();
  });

  it('Renderd differently without $titleKey and $displayProps in data object', () => {
    const nItems = [...items].map(({ title, ...item }) => {
      return {
        ...item,
        name: title,
      };
    });
    expect(shallow(<Table items={nItems} />).html()).toMatchSnapshot();
  });

  it('Renderd differently without $titleKey and including $displayProps in data object', () => {
    const nItems = [...items].map(({ title, ...item }) => {
      return {
        ...item,
        name: title,
      };
    });
    expect(
      shallow(<Table items={nItems} displayProps={{ date: 'Datum' }} />).html()
    ).toMatchSnapshot();
  });
});
