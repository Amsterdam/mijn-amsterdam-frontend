import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import StatusLine from './StatusLine';
import { StatusLineItem } from '../../../universal/types/App.types';

const TEST_ITEM: StatusLineItem = {
  id: 'step-1',
  status: 'FOO',
  datePublished: '2020-01-10',
  description: 'A line item',
  documents: [
    {
      title: 'Document title',
      id: 'document-1',
      url: 'https://foo.bar/document.pdf',
      datePublished: '2020-01-10',
    },
  ],
  isActive: false,
  isChecked: true,
};

const items: StatusLineItem[] = [TEST_ITEM];

describe('<StatusLine />', () => {
  it('Renders correctly', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <StatusLine id="unittest" trackCategory="unittest" items={items} />
        </BrowserRouter>
      </RecoilRoot>
    );
    expect(screen.getByText(TEST_ITEM.description!)).toBeInTheDocument();
    expect(screen.getByText(TEST_ITEM.status)).toBeInTheDocument();
    expect(
      screen.getByText(TEST_ITEM?.documents![0]?.title)
    ).toBeInTheDocument();
  });
});
