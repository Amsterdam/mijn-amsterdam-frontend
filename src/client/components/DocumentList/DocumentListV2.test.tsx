import { render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';

import { DocumentListV2 } from './DocumentListV2.tsx';
import { bffApiHost } from '../../../testing/setup.ts';
import type { GenericDocument } from '../../../universal/types/App.types.ts';

vi.mock('../../hooks/analytics.hook.ts');

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

test('Add custom columns', async () => {
  render(<DocumentListV2 documents={ITEMS} columns={['document', 'datum']} />);

  screen.findByText('document');
  expect(screen.queryByText('Document')).not.toBeInTheDocument();
  screen.findByText('datum');
  expect(screen.queryByText('Datum')).not.toBeInTheDocument();
});
