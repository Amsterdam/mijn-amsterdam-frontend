import { Table } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { DocumentLink } from './DocumentLink';
import styles from './DocumentListV2.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { GenericDocument } from '../../../universal/types/App.types';

interface DocumentListProps<T extends GenericDocument = GenericDocument> {
  documents: T[];
  trackPath?: (document: T) => string;
  columns?: [string, string];
  className?: string;
}

export default function DocumentListV2({
  documents,
  trackPath,
  columns,
  className,
}: DocumentListProps) {
  const [colH1, colH2] = columns ?? ['Document', 'Datum'];

  return (
    <Table className={classNames(styles.DocumentListV2, className)}>
      {(colH1 || colH2) && (
        <thead>
          <tr>
            {colH1 && <th>{colH1}</th>}
            {colH2 && <th>{colH2}</th>}
          </tr>
        </thead>
      )}
      <tbody>
        {documents
          .filter((document) =>
            typeof document.isVisible !== 'undefined'
              ? document.isVisible
              : true
          )
          .map((document) => (
            <tr key={document.id}>
              <td>
                <DocumentLink
                  key={document.id}
                  document={document}
                  trackPath={trackPath}
                />
              </td>
              {document.datePublished && (
                <td>
                  <time>{defaultDateFormat(document.datePublished)}</time>
                </td>
              )}
            </tr>
          ))}
      </tbody>
    </Table>
  );
}
