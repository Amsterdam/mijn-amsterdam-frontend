import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi, Mock } from 'vitest';

import DocumentListV2 from './DocumentListV2';
import { bffApiHost } from '../../../testing/setup';
import { bffApi } from '../../../testing/utils';
import { GenericDocument } from '../../../universal/types/App.types';
import * as Monitoring from '../../helpers/monitoring';
import { trackDownload } from '../../hooks/analytics.hook';

vi.mock('../../hooks/analytics.hook');

const ITEMS: GenericDocument[] = [
  {
    datePublished: '2019-03-23T00:00:00+01:00',
    id: '24078091',
    title: 'Uitkeringsspecificatie',
    url: `${bffApiHost}/wpi/document?id=24078091&isBulk=false&isDms=false`,
  },
  {
    datePublished: '2014-01-24T00:00:00+01:00',
    id: '30364921',
    title: 'Uitkeringsspecificatie',
    url: `${bffApiHost}/wpi/document?id=30364921&isBulk=false&isDms=false`,
  },
];

describe('DocumentListV2', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Clicking a link fires tracking call', async () => {
    const user = userEvent.setup();
    (trackDownload as Mock).mockReturnValue(null);

    bffApi
      .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
      .reply(200, 'x');

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2 documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    const downloadLinks = screen.getAllByText(ITEMS[0].title);
    expect(downloadLinks.length).toBe(2);

    await user.click(downloadLinks[0]);

    await waitFor(() =>
      expect(trackDownload).toHaveBeenCalledWith(
        ITEMS[0].title,
        'pdf',
        // The additional leading / is representing window.location.pathname
        '//downloads/' + ITEMS[0].title + '.pdf',
        'private'
      )
    );
  });

  it('trackPath function is used to create the link sent to the tracking call', async () => {
    const user = userEvent.setup();
    (trackDownload as Mock).mockReturnValue(null);

    bffApi
      .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
      .reply(200, 'x');

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

    const downloadLink = screen.getAllByText(ITEMS[0].title)[0];
    await user.click(downloadLink);

    await waitFor(() =>
      expect(trackDownload).toHaveBeenCalledWith(
        ITEMS[0].title,
        'pdf',
        // The additional leading / is representing window.location.pathname
        '/compleet/ander/pad.pdf',
        'private'
      )
    );
  });

  it('Clicking a link does not fire a tracking call when the link returns a 404 status', async () => {
    const user = userEvent.setup();

    const captureException = vi.spyOn(Monitoring, 'captureException');

    bffApi
      .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
      .reply(404, 'not found');

    render(
      <RecoilRoot>
        <BrowserRouter>
          <DocumentListV2 documents={ITEMS} />
        </BrowserRouter>
      </RecoilRoot>
    );

    const downloadLink = screen.getAllByText(ITEMS[0].title)[0];
    await user.click(downloadLink);

    await waitFor(() => expect(trackDownload).not.toHaveBeenCalled());
    await screen.findByText('Downloaden mislukt');
    await waitFor(() =>
      expect(captureException).toHaveBeenCalledWith(
        new Error(`Failed to download document. Code: 404`),
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
