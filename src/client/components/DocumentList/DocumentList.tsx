import * as Sentry from '@sentry/react';
import classnames from 'classnames';
import { useCallback, useState } from 'react';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconAlert, IconDownload } from '../../assets/icons';
import { Colors } from '../../config/app';
import { trackPageViewWithProfileType } from '../../hooks/analytics.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import Linkd from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import styles from './DocumentList.module.scss';

interface DocumentLinkProps {
  document: GenericDocument;
  label?: string;
  trackPath?: (document: GenericDocument) => string;
}

interface DocumentListProps {
  documents: GenericDocument[];
  isExpandedView?: boolean;
  trackPath?: (document: GenericDocument) => string;
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

export function DocumentLink({
  document,
  label,
  trackPath,
}: DocumentLinkProps) {
  const [isErrorVisible, setErrorVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const profileType = useProfileTypeValue();

  const onClickDocumentLink = useCallback(
    (event) => {
      event.preventDefault();
      if (isLoading) {
        return false;
      }
      setLoading(true);

      if (!('fetch' in window)) {
        downloadFile(document);
        return;
      }

      // First check to see if the request will succeed or not.
      fetch(document.url)
        .then((res) => {
          setLoading(false);

          if (res.status !== 200) {
            throw new Error(
              `Failed to download document. Error: ${res.statusText}, Code: ${res.status}`
            );
          }

          return res.blob();
        })
        .then((blob) => {
          const trackingUrl = trackPath
            ? trackPath(document)
            : window.location.pathname +
              addFileType(
                `/downloads/${document.download || document.title}`,
                document.type
              );

          // Tracking pageview here because trackDownload doesn't work properly in Matomo.
          trackPageViewWithProfileType(
            document.title,
            trackingUrl,
            profileType
          );

          if (!blob) {
            downloadFile(document);
          } else {
            if (
              window.navigator &&
              (window.navigator as any).msSaveOrOpenBlob
            ) {
              (window.navigator as any).msSaveOrOpenBlob(blob, document.title);
            } else {
              try {
                const fileUrl = window.URL.createObjectURL(blob);
                downloadFile({
                  ...document,
                  url: fileUrl,
                });
              } catch (error) {
                downloadFile(document);
              }
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          Sentry.captureException(error, {
            extra: {
              title: document.title,
              url: document.url,
            },
          });
          setErrorVisible(true);
        });
      return false;
    },
    [document, profileType, isLoading]
  );

  return (
    <span className={styles.DocumentLinkWrap}>
      <span className={styles.DownloadIcon}>
        {isLoading ? (
          <Spinner />
        ) : isErrorVisible ? (
          <IconAlert
            aria-hidden="true"
            width="18"
            height="18"
            fill={Colors.primaryRed}
          />
        ) : (
          <IconDownload aria-hidden="true" width="14" height="14" />
        )}
      </span>
      <Linkd
        className={classnames(
          styles.DocumentLink,
          isErrorVisible && styles.DocumentLinkError
        )}
        icon={null}
        external={document.url.startsWith('http')}
        href={document.url}
        onClick={onClickDocumentLink}
      >
        {label || document.title}
      </Linkd>
      {isLoading && <span className={styles.DownloadInfo}>Ophalen...</span>}
      {isErrorVisible && (
        <span className={styles.DownloadInfo}>Download mislukt</span>
      )}
    </span>
  );
}

export default function DocumentList({
  documents,
  isExpandedView = false,
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
              {document.title}
              <DocumentLink
                key={document.id}
                document={document}
                label="Download"
                trackPath={trackPath}
              />
            </>
          ) : (
            <DocumentLink
              key={document.id}
              document={document}
              trackPath={trackPath}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
