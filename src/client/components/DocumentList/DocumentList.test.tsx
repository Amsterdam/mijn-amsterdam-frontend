import * as Sentry from '@sentry/browser';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { GenericDocument } from '../../../universal/types/App.types';
import * as analytics from '../../hooks/analytics.hook';
import { trackPageViewWithProfileType } from '../../hooks/analytics.hook';
import DocumentList from './DocumentList';

jest.mock('../../hooks/analytics.hook');

const ITEMS: GenericDocument[] = [
  {
    datePublished: '2019-03-23T00:00:00+01:00',
    id: '24078091',
    title: 'Uitkeringsspecificatie',
    type: 'pdf',
    url: '/api/focus/document?id=24078091&isBulk=false&isDms=false',
  },
  {
    datePublished: '2014-01-24T00:00:00+01:00',
    id: '30364921',
    title: 'Uitkeringsspecificatie',
    type: 'pdf',
    url: '/api/focus/document?id=30364921&isBulk=false&isDms=false',
  },
];

describe('DocumentList', () => {
  (window as any).URL = {
    createObjectURL: jest.fn((blob: any) => void 0),
  };
  (window as any).location = { assign: jest.fn((file: any) => void 0) };

  // beforeEach(() => {
  //   fetch.mockClear();
  //   track.mockClear();
  // });

  it('Clicking a link fires tracking call', async () => {
    const fetch = ((global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, blob: () => null }));

    (trackPageViewWithProfileType as jest.Mock).mockReturnValue(null);

    const captureException = ((Sentry as any).captureException = jest.fn());

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentList documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getAllByText(ITEMS[0].title).length).toBe(2);
    userEvent.click(screen.getAllByText(ITEMS[0].title)[0]);
    // await act(async () => {
    //   Linkd.simulate('click');
    // });
    expect(fetch).toHaveBeenCalledWith(ITEMS[0].url);
    setTimeout(() => {
      expect(trackPageViewWithProfileType).toHaveBeenCalledWith(
        ITEMS[0].title,
        // The additional leading / is representing window.location.pathname
        '//downloads/' + ITEMS[0].title + '.pdf',
        'prive'
      );
    }, 0);
  });

  it('Clicking a link fires tracking call', async () => {
    const fetch = ((global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 404, statusText: 'not found' }));
    const track = ((analytics as any).trackPageViewWithProfileType = jest.fn());
    const captureException = ((Sentry as any).captureException = jest.fn());

    const component = render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentList documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    userEvent.click(screen.getAllByText(ITEMS[0].title)[0]);

    setTimeout(() => {
      expect(track).not.toHaveBeenCalled();
      expect(captureException).toHaveBeenCalledWith(
        new Error(`Failed to download document. Error: not found, Code: 404`),
        {
          extra: {
            title: ITEMS[0].title,
            url: ITEMS[0].url,
          },
        }
      );
    }, 0);
  });
});
