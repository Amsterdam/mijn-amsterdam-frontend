import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { expect, vi } from 'vitest';

import { DocumentLink } from './DocumentLink.tsx';
import { bffApiHost } from '../../../testing/setup.ts';
import { bffApi } from '../../../testing/utils.ts';
import type { GenericDocument } from '../../../universal/types/App.types.ts';
import * as Monitoring from '../../helpers/monitoring.ts';
import { trackDownload } from '../../hooks/analytics.hook.ts';

vi.mock('../../hooks/analytics.hook');

const downloadDocumentPath =
  '/wpi/document?id=24078091&isBulk=false&isDms=false';

const docWithoutExtension: GenericDocument = {
  datePublished: '2019-03-23T00:00:00+01:00',
  id: '24078091',
  title: 'Uitkeringsspecificatie',
  url: `${bffApiHost}${downloadDocumentPath}`,
};

const docx: GenericDocument = {
  datePublished: '2019-03-23T00:00:00+01:00',
  id: '24078091',
  title: 'Uitkeringsspecificatie',
  url: `${bffApiHost}${downloadDocumentPath}`,
  filename: '12345.docx',
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('Displays file extension if specified', () => {
  const screen = render(<DocumentLink document={docx} />);
  screen.getByText(new RegExp('docx'));
});

test('Displays no file extension when not specified', () => {
  const screen = render(<DocumentLink document={docWithoutExtension} />);
  screen.getByText(docWithoutExtension.title);
});

test('Clicking a link fires tracking call', async () => {
  const user = userEvent.setup();
  (trackDownload as Mock).mockReturnValue(null);

  bffApi.get(downloadDocumentPath).reply(200, 'x');

  render(<DocumentLink document={docWithoutExtension} />);

  const downloadLink = screen.getByText(docWithoutExtension.title);

  await user.click(downloadLink);
  await waitFor(() =>
    expect(trackDownload).toHaveBeenCalledWith(
      docWithoutExtension.title,
      'pdf',
      // The additional leading / is representing window.location.pathname
      '//downloads/' + docWithoutExtension.title + '.pdf',
      'private'
    )
  );
});

test('trackPath function is used to create the link sent to the tracking call', async () => {
  const user = userEvent.setup();
  (trackDownload as Mock).mockReturnValue(null);

  bffApi.get(downloadDocumentPath).reply(200, 'x');

  render(
    <DocumentLink
      document={docWithoutExtension}
      trackPath={() => {
        return '/compleet/ander/pad.pdf';
      }}
    />
  );

  const downloadLink = screen.getByText(docWithoutExtension.title);
  await user.click(downloadLink);

  await waitFor(() =>
    expect(trackDownload).toHaveBeenCalledWith(
      docWithoutExtension.title,
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

  bffApi.get(downloadDocumentPath).reply(404, 'not found');

  render(<DocumentLink document={docWithoutExtension} />);

  const downloadLink = screen.getAllByText(docWithoutExtension.title)[0];
  await user.click(downloadLink);

  await waitFor(() => expect(trackDownload).not.toHaveBeenCalled());
  await screen.findByText('Downloaden mislukt');
  await waitFor(() =>
    expect(captureException).toHaveBeenCalledWith(
      new Error(`Failed to download document. Code: 404`),
      {
        properties: {
          title: docWithoutExtension.title,
          url: docWithoutExtension.url,
        },
      }
    )
  );
});
