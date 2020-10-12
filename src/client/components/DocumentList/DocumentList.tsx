import React from 'react';
import { IconDownload } from '../../assets/icons';
import { Linkd } from '../index';
import styles from './DocumentList.module.scss';
import { GenericDocument } from '../../../universal/types/App.types';
import classnames from 'classnames';

interface DocumentLinkProps {
  document: GenericDocument;
  label?: string;
}

interface DocumentListProps {
  documents: GenericDocument[];
  isExpandedView?: boolean;
}

export function DocumentLink({ document, label }: DocumentLinkProps) {
  return (
    <Linkd
      className={classnames(styles.DocumentLink, 'download')}
      href={document.url}
      external={true}
      download={document.title}
      icon={IconDownload}
    >
      {label || document.title}
    </Linkd>
  );
}

export default function DocumentList({
  documents,
  isExpandedView = false,
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
              {document.title}
              <DocumentLink
                key={document.id}
                document={document}
                label="Download"
              />
            </>
          ) : (
            <DocumentLink key={document.id} document={document} />
          )}
        </li>
      ))}
    </ul>
  );
}
