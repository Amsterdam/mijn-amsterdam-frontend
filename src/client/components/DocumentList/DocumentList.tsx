import classnames from 'classnames';
import React from 'react';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconDownload } from '../../assets/icons';
import { trackDownload, trackPageView } from '../../hooks/analytics.hook';
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
  const downloadName = addFileType(
    docDownload.download || docDownload.title,
    docDownload.type
  );
  link.download = downloadName;
  link.click();
}

function addFileType(url: string, type: string = '') {
  if (
    type &&
    !url.endsWith('.' + type) &&
    !url.endsWith('.' + type.toUpperCase())
  ) {
    return `${url}.${type}`;
  }
  return url;
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
        const downloadUrl = addFileType(
          `/downloads/${document.title}`,
          document.type
        );
        // Tracking pageview here because trackDownload doesn't work properly in Matomo
        trackPageView(document.title, window.location.pathname + downloadUrl);
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
