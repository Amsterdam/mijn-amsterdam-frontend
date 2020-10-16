import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import React from 'react';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconDownload } from '../../assets/icons';
import { trackPageView } from '../../hooks/analytics.hook';
import Linkd from '../Button/Button';
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
    <Linkd
      className={styles.DocumentLink}
      icon={IconDownload}
      href={document.url}
      onClick={event => {
        event.preventDefault();
        fetch(document.url).then(response => {
          const trackingUrl =
            window.location.pathname +
            addFileType(
              `/downloads/${document.download || document.title}`,
              document.type
            );

          if (response.status !== 200) {
            Sentry.captureException('Could not download document', {
              extra: {
                title: document.title,
                url: document.url,
              },
            });
          } else {
            // Tracking pageview here because trackDownload doesn't work properly in Matomo
            trackPageView(document.title, trackingUrl);
            downloadFile(document);
          }
        });
        return false;
      }}
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
      {documents.map(document => (
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
