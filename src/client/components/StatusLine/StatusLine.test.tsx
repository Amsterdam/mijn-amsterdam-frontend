import React from 'react';
import { shallow } from 'enzyme';
import StatusLine from './StatusLine';
import { StatusLineItem } from './StatusLine';
import { BrowserRouter } from 'react-router-dom';
import * as profileTypeHook from '../../hooks/useProfileType';

const items: StatusLineItem[] = [
  {
    id: 'step-1',
    status: 'FOO',
    datePublished: '2020-01-10',
    description: 'A line item',
    documents: [
      {
        title: 'Document title',
        type: 'pdf',
        id: 'document-1',
        url: 'https://foo.bar/document.pdf',
        datePublished: '2020-01-10',
      },
    ],
    isActive: false,
    isChecked: true,
  },
];

// TODO: Test more/less, html content, multiple items
describe('<StatusLine />', () => {
  const profileTypeHookMock = ((profileTypeHook as any).useProfileTypeValue = jest.fn(
    () => 'prive'
  ));

  afterAll(() => {
    profileTypeHookMock.mockRestore();
  });

  it('Renders the correct html', () => {
    expect(
      shallow(
        <BrowserRouter>
          <StatusLine id="unittest" trackCategory="unittest" items={items} />
        </BrowserRouter>
      ).html()
    ).toMatchSnapshot();
  });
});
