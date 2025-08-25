import { dedupeDocumentsInDataSets } from './document';
import { GenericDocument } from '../types/App.types';

type TestData = Array<{ documents: GenericDocument[] }>;

test('Dedupes documents in one dataset', () => {
  const data: TestData = [
    {
      documents: [
        {
          id: '1',
          title: 'doc-1',
          url: '',
          datePublished: '2025-07-15T15:18:55.68',
        },
        {
          id: '1',
          title: 'doc-1',
          url: '',
          datePublished: '2025-07-15T15:18:55.68',
        },
      ],
    },
  ];
  const result = dedupeDocumentsInDataSets(data, 'documents');
  expect(result).toStrictEqual([
    {
      documents: [
        {
          id: '1',
          title: 'doc-1',
          url: '',
          datePublished: '2025-07-15T15:18:55.68',
        },
      ],
    },
  ]);
});

test('Dedupes documents across multiple datasets', () => {
  const data: TestData = [
    {
      documents: [
        {
          id: '1',
          title: 'doc-1',
          url: '',
          datePublished: '2025-07-15T15:18:55.68',
        },
        {
          id: '2',
          title: 'doc-2',
          url: '',
          datePublished: '2025-05-20T10:47:13.323',
        },
      ],
    },
    {
      documents: [
        {
          id: '2',
          title: 'doc-2',
          url: '',
          datePublished: '2025-05-20T10:47:13.323',
        },
      ],
    },
  ];
  const result = dedupeDocumentsInDataSets(data, 'documents');
  expect(result).toStrictEqual([
    {
      documents: [
        {
          id: '1',
          title: 'doc-1',
          url: '',
          datePublished: '2025-07-15T15:18:55.68',
        },
        {
          id: '2',
          title: 'doc-2',
          url: '',
          datePublished: '2025-05-20T10:47:13.323',
        },
      ],
    },
    { documents: [] },
  ]);
});
