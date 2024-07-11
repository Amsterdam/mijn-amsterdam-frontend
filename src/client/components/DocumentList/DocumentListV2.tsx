import { defaultDateFormat } from '../../../universal/helpers/date';
import { GenericDocument } from '../../../universal/types/App.types';
import { DocumentLink } from './DocumentLink';
import styles from './DocumentListV2.module.scss';

interface DocumentListProps<T extends GenericDocument = GenericDocument> {
  documents: T[];
  trackPath?: (document: T) => string;
}

export default function DocumentListV2({
  documents,
  trackPath,
}: DocumentListProps) {
  return (
    <table className={styles.DocumentListV2}>
      <thead>
        <tr>
          <th>Document</th>
          <th>Datum</th>
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
