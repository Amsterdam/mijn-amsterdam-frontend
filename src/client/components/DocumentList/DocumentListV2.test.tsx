import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi, Mock } from 'vitest';

import DocumentListV2 from './DocumentListV2.tsx';
import { GenericDocument } from '../../../universal/types/App.types.ts';
import * as Monitoring from '../../helpers/monitoring.ts';
import * as analytics from '../../hooks/analytics.hook.ts';
import { trackDownload } from '../../hooks/analytics.hook.ts';

vi.mock('../../hooks/analytics.hook');

const ITEMS: GenericDocument[] = [
  {
    datePublished: '2019-03-23T00:00:00+01:00',
    id: '24078091',
    title: 'Uitkeringsspecificatie',
    url: '/wpi/document?id=24078091&isBulk=false&isDms=false',
  },
  {
    datePublished: '2014-01-24T00:00:00+01:00',
    id: '30364921',
    title: 'Uitkeringsspecificatie',
    url: '/wpi/document?id=30364921&isBulk=false&isDms=false',
  },
];

describe('DocumentListV2', () => {
  Object.defineProperty(window, 'location', {
    value: {
      ...globalThis.location,
    },
    writable: true,
  });

  it('Clicking a link fires tracking call', async () => {
    const user = userEvent.setup();

    const originalFn = console.error;
    console.error = vi.fn(); // Hide warnings about navigation not implemented exceptions.

    const fetch = ((globalThis as any).fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 200, blob: () => null }));

    (trackDownload as Mock).mockReturnValue(null);

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2 documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getAllByText(ITEMS[0].title).length).toBe(2);

    await user.click(screen.getAllByText(ITEMS[0].title)[0]);

    expect(fetch).toHaveBeenCalledWith(ITEMS[0].url, {
      credentials: 'include',
    });

    await waitFor(() =>
      expect(trackDownload).toHaveBeenCalledWith(
        ITEMS[0].title,
        'pdf',
        // The additional leading / is representing window.location.pathname
        '//downloads/' + ITEMS[0].title + '.pdf',
        'private'
      )
    );

    console.error = originalFn;
  });

  it('trackPath function is used to create the link sent to the tracking call', async () => {
    const user = userEvent.setup();
    const originalFn = console.error;
    console.error = vi.fn(); // Hide warnings about navigation not implemented exceptions.

    (globalThis as any).fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 200, blob: () => null });

    (trackDownload as Mock).mockReturnValue(null);

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2
            documents={ITEMS}
            trackPath={(document) => {
              return '/compleet/ander/pad.pdf';
            }}
          />
        </BrowserRouter>
      </RecoilRoot>
    );

    await user.click(screen.getAllByText(ITEMS[0].title)[0]);

    await waitFor(() =>
      expect(trackDownload).toHaveBeenCalledWith(
        ITEMS[0].title,
        'pdf',
        // The additional leading / is representing window.location.pathname
        '/compleet/ander/pad.pdf',
        'private'
      )
    );

    console.error = originalFn;
  });

  it('Clicking a link does not fire a tracking call when the link returns a 404 status', async () => {
    const user = userEvent.setup();

    const fetch = ((globalThis as any).fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 404, statusText: 'not found' }));
    const track = ((analytics as any).trackDownload = vi.fn());
    const captureException = vi.spyOn(Monitoring, 'captureException');

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2 documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    await user.click(screen.getAllByText(ITEMS[0].title)[0]);

    expect(fetch).toHaveBeenCalledWith(ITEMS[0].url, {
      credentials: 'include',
    });

    await waitFor(() => expect(track).not.toHaveBeenCalled());
    await screen.findByText('Downloaden mislukt');
    await waitFor(() =>
      expect(captureException).toHaveBeenCalledWith(
        new Error(`Failed to download document. Error: not found, Code: 404`),
        {
          properties: {
            title: ITEMS[0].title,
            url: ITEMS[0].url,
          },
        }
      )
    );
  });

  it('Add custom columns', async () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2 documents={ITEMS} columns={['document', 'datum']} />
        </BrowserRouter>
      </RecoilRoot>
    );

    screen.findByText('document');
    expect(screen.queryByText('Document')).not.toBeInTheDocument();
    screen.findByText('datum');
    expect(screen.queryByText('Datum')).not.toBeInTheDocument();
  });
});
