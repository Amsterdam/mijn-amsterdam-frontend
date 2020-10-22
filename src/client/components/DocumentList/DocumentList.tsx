import * as Sentry from '@sentry/browser';
import classnames from 'classnames';
import React, { useCallback, useState } from 'react';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconAlert, IconDownload } from '../../assets/icons';
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
  const [isErrorVisible, setErrorVisible] = useState(false);

  const onClickDocumentLink = useCallback(
    event => {
      event.preventDefault();
      // First check to see if the request will succeed or not.
      fetch(document.url).then(response => {
        const trackingUrl =
          window.location.pathname +
          addFileType(
            `/downloads/${document.download || document.title}`,
            document.type
          );

        // Show error if request fails
        if (response.status !== 200) {
          Sentry.captureException('Could not download document', {
            extra: {
              title: document.title,
              url: document.url,
            },
          });
          setErrorVisible(true);
        } else {
          // Tracking pageview here because trackDownload doesn't work properly in Matomo.
          trackPageView(document.title, trackingUrl);
          // Make the file download available to the browser.
          downloadFile(document);
        }
      });
      return false;
    },
    [document]
  );

  return (
    <span className={styles.DocumentLinkWrap}>
      <Linkd
        className={classnames(
          styles.DocumentLink,
          isErrorVisible && styles.DocumentLinkError
        )}
        icon={isErrorVisible ? IconAlert : IconDownload}
        href={document.url}
        onClick={onClickDocumentLink}
      >
        {label || document.title}
      </Linkd>
      {isErrorVisible && (
        <span className={styles.DownloadError}>Download niet beschikbaar</span>
      )}
    </span>
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
