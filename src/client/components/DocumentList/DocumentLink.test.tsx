import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi, Mock } from 'vitest';

import { DocumentLink } from './DocumentLink';
import { bffApiHost } from '../../../testing/setup';
import { bffApi } from '../../../testing/utils';
import { GenericDocument } from '../../../universal/types/App.types';
import * as Monitoring from '../../helpers/monitoring';
import { trackDownload } from '../../hooks/analytics.hook';

vi.mock('../../hooks/analytics.hook');

const DOCS: Record<string, GenericDocument> = {
  uitkeringSpecificatieA: {
    datePublished: '2019-03-23T00:00:00+01:00',
    id: '24078091',
    title: 'Uitkeringsspecificatie',
    url: `${bffApiHost}/wpi/document?id=24078091&isBulk=false&isDms=false`,
  },
  uitkeringSpecificatieB: {
    datePublished: '2014-01-24T00:00:00+01:00',
    id: '30364921',
    title: 'Uitkeringsspecificatie',
    url: `${bffApiHost}/wpi/document?id=30364921&isBulk=false&isDms=false`,
  },
};

beforeEach(() => {
  vi.resetAllMocks();
});
test('Handles multiple file extensions', () => {});

test('Clicking a link fires tracking call', async () => {
  const user = userEvent.setup();
  (trackDownload as Mock).mockReturnValue(null);

  bffApi
    .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
    .reply(200, 'x');

  const doc = DOCS.uitkeringSpecificatieA;
  render(<DocumentLink document={doc} />);

  const downloadLink = screen.getByText(doc.title);

  await user.click(downloadLink);
  await waitFor(() =>
    expect(trackDownload).toHaveBeenCalledWith(
      doc.title,
      'pdf',
      // The additional leading / is representing window.location.pathname
      '//downloads/' + doc.title + '.pdf',
      'private'
    )
  );
});

test('trackPath function is used to create the link sent to the tracking call', async () => {
  const user = userEvent.setup();
  (trackDownload as Mock).mockReturnValue(null);
  const doc = DOCS.uitkeringSpecificatieA;

  bffApi
    .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
    .reply(200, 'x');

  render(
    <DocumentLink
      document={doc}
      trackPath={() => {
        return '/compleet/ander/pad.pdf';
      }}
    />
  );

  const downloadLink = screen.getByText(doc.title);
  await user.click(downloadLink);

  await waitFor(() =>
    expect(trackDownload).toHaveBeenCalledWith(
      doc.title,
      'pdf',
      // The additional leading / is representing window.location.pathname
      '/compleet/ander/pad.pdf',
      'private'
    )
  );
});

test('Clicking a link does not fire a tracking call when the link returns a 404 status', async () => {
  const user = userEvent.setup();

  const captureException = vi.spyOn(Monitoring, 'captureException');
  const doc = DOCS.uitkeringSpecificatieA;

  bffApi
    .get('/wpi/document?id=24078091&isBulk=false&isDms=false')
    .reply(404, 'not found');

  render(<DocumentLink document={doc} />);

  const downloadLink = screen.getAllByText(doc.title)[0];
  await user.click(downloadLink);

  await waitFor(() => expect(trackDownload).not.toHaveBeenCalled());
  await screen.findByText('Downloaden mislukt');
  await waitFor(() =>
    expect(captureException).toHaveBeenCalledWith(
      new Error(`Failed to download document. Code: 404`),
      {
        properties: {
          title: doc.title,
          url: doc.url,
        },
      }
    )
  );
});
