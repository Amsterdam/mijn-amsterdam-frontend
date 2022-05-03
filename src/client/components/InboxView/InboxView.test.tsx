import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { defaultDateFormat } from '../../../universal/helpers';
import { InboxItem, InboxView } from './InboxView';

describe('InboxView', () => {
  const item: InboxItem = {
    status: 'in-progress',
    description: 'Some description about progress',
    datePublished: '2022-05-03T13:09:00',
    documents: [
      {
        id: 'doc1',
        datePublished: '2022-05-03T13:09:00',
        url: 'http://localhost/download/item.pdf',
        title: 'Some document title',
      },
    ],
  };
  it('Renders everything correctly', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <InboxView items={[item]} />
        </BrowserRouter>
      </RecoilRoot>
    );
    expect(screen.getByText(item.status)).toBeInTheDocument();
    expect(screen.getByText(item.description)).toBeInTheDocument();
    expect(
      screen.getByText(defaultDateFormat(item.datePublished))
    ).toBeInTheDocument();
    expect(screen.getByText(item.documents[0].title)).toBeInTheDocument();
  });
});
