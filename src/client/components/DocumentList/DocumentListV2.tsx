import { defaultDateFormat } from '../../../universal/helpers/date';
import { GenericDocument } from '../../../universal/types/App.types';
import { DocumentLink } from './DocumentLink';
import styles from './DocumentListV2.module.scss';

interface DocumentListProps<T extends GenericDocument = GenericDocument> {
  documents: T[];
  trackPath?: (document: T) => string;
  columns?: [string, string];
}

export default function DocumentListV2({
  documents,
  trackPath,
  columns,
}: DocumentListProps) {
  const columnHeaders = columns ?? ['Document', 'Datum'];

  return (
    <table className={styles.DocumentListV2}>
      <thead>
        <tr>
          <th>{columnHeaders[0]}</th>
          <th>{columnHeaders[1]}</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>
              <DocumentLink
                key={document.id}
                document={document}
                trackPath={trackPath}
              />
            </td>
            <td>
              <time>{defaultDateFormat(document.datePublished)}</time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
