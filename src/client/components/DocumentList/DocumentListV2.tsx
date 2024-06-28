import classnames from 'classnames';
import { defaultDateFormat } from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types/App.types';
import { DocumentLink } from './DocumentLink';
import styles from './DocumentListV2.module.scss';
import { Table } from '@amsterdam/design-system-react';

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
        <th>Document</th>
        <th>Datum</th>
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
