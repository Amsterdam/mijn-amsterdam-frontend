import classnames from 'classnames';
import React from 'react';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconDownload } from '../../assets/icons';
import { trackDownload } from '../../hooks/analytics.hook';
import { Button } from '../Button/Button';
import styles from './DocumentList.module.scss';

interface DocumentLinkProps {
  document: GenericDocument;
  label?: string;
}

interface DocumentListProps {
  documents: GenericDocument[];
  isExpandedView?: boolean;
}

function downloadFile(docDownload: GenericDocument) {
  var link = document.createElement('a');
  link.href = docDownload.url;
  link.download = docDownload.download || docDownload.title;
  link.click();
}

export function DocumentLink({ document, label }: DocumentLinkProps) {
  return (
    <Button
      className={styles.DocumentLink}
      icon={IconDownload}
      variant="plain"
      lean={true}
      onClick={(event) => {
        event.preventDefault();
        trackDownload(
          `${document.url}${document.type ? `.${document.type}` : ''}`
        );
        downloadFile(document);
      }}
    >
      {label || document.title}
    </Button>
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
