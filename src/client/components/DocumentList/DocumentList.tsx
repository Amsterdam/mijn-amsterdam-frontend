import classnames from 'classnames';
import { defaultDateFormat } from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types/App.types';
import { DocumentLink } from './DocumentLink';
import styles from './DocumentList.module.scss';

interface DocumentListProps {
  documents: GenericDocument[];
  isExpandedView?: boolean;
  showDatePublished?: boolean;
  trackPath?: (document: GenericDocument) => string;
}

export default function DocumentList({
  documents,
  isExpandedView = false,
  showDatePublished = false,
  trackPath,
}: DocumentListProps) {
  return (
    <ul
      className={classnames(
        styles.DocumentList,
        isExpandedView && styles[`DocumentList--expandedView`]
      )}
    >
      {documents.map((document) => (
        <li className={styles.DocumentListItem} key={document.id}>
          {isExpandedView ? (
            <>
              <span>{document.title}</span>
              <DocumentLink
                key={document.id}
                document={document}
                label="Download"
                trackPath={trackPath}
              />
            </>
          ) : (
            <>
              <DocumentLink
                key={document.id}
                document={document}
                trackPath={trackPath}
              />
              {showDatePublished && (
                <time className={styles.DocumentListItem_Date}>
                  {defaultDateFormat(document.datePublished)}
                </time>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
