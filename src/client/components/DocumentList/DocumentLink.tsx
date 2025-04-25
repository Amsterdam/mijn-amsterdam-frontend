import { useCallback, useState } from 'react';

import { Icon } from '@amsterdam/design-system-react';
import { AlertIcon, DownloadIcon } from '@amsterdam/design-system-react-icons';
import { HttpStatusCode } from 'axios';
import classnames from 'classnames';

import styles from './DocumentLink.module.scss';
import type { GenericDocument } from '../../../universal/types/App.types';
import { captureException } from '../../helpers/monitoring';
import { trackDownload } from '../../hooks/analytics.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { MaLink } from '../MaLink/MaLink';
import { Spinner } from '../Spinner/Spinner';

interface DocumentLinkProps {
  document: GenericDocument;
  label?: string;
  trackPath?: (document: GenericDocument) => string;
}

function downloadFile(docDownload: GenericDocument) {
  const link = document.createElement('a');
  link.href = docDownload.url;
  const downloadName = addFileType(docDownload.download || docDownload.title);
  link.download = downloadName;
  link.click();
}

function addFileType(url: string) {
  const defaultType = 'pdf';
  const splitUrl = url.split('.');

  // NOTE: if we don't fond a  "." in the url then add a default filetype.
  if (splitUrl.length === 1) {
    return `${url}.${defaultType}`;
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
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      if (isLoading) {
        return false;
      }
      setErrorVisible(false);
      setLoading(true);

      if (!('fetch' in window) || document?.external) {
        downloadFile(document);
        return;
      }

      // First check to see if the request will succeed or not.
      fetch(document.url, { credentials: 'include' })
        .then((res) => {
          setLoading(false);

          if (res.status !== HttpStatusCode.Ok) {
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
              addFileType(`/downloads/${document.download || document.title}`);

          const fileType = trackingUrl.split('.').pop();

          trackDownload(document.title, fileType, trackingUrl, profileType);

          if (!blob) {
            downloadFile(document);
          } else if (
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
            } catch (_) {
              downloadFile(document);
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          captureException(error, {
            properties: {
              title: document.title,
              url: document.url,
            },
          });
          setErrorVisible(true);
        });
      return false;
    },
    [document, profileType, isLoading, trackPath, setErrorVisible]
  );

  return (
    <span
      className={classnames(
        styles.DocumentLinkWrap,
        isErrorVisible && styles.DocumentDownloadError
      )}
    >
      <MaLink
        maVariant="noDefaultUnderline"
        className={classnames(
          styles.DocumentLink,
          isErrorVisible && styles.DocumentLinkError
        )}
        href={document.url}
        onClick={onClickDocumentLink}
      >
        <span className={styles.DocumentLinkIcon}>
          {isLoading && <Spinner />}
          {!isLoading && (
            <Icon
              svg={isErrorVisible ? AlertIcon : DownloadIcon}
              size="level-5"
            />
          )}
        </span>
        {label || document.title || 'Document'}
      </MaLink>
      {isLoading && <span className={styles.DownloadInfo}>Downloaden...</span>}
      {isErrorVisible && (
        <span className={styles.DownloadInfo}>Downloaden mislukt</span>
      )}
    </span>
  );
}
