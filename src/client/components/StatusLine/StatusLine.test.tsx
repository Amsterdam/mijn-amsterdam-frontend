import React from 'react';
import { shallow } from 'enzyme';
import StatusLine from './StatusLine';
import { StatusLineItem } from './StatusLine';

// TODO: Test more/less, html content, multiple items
describe('<StatusLine />', () => {
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
      isLastActive: false,
      isChecked: true,
    },
  ];
  it('Renders the correct html', () => {
    expect(
      shallow(
        <StatusLine id="unittest" trackCategory="unittest" items={items} />
      ).html()
    ).toMatchSnapshot();
  });
});
