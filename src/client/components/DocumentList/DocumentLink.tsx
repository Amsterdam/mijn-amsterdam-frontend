import { useCallback, useState } from 'react';

import { Icon } from '@amsterdam/design-system-react';
import {
  WarningIcon,
  DownloadIcon,
} from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';

import styles from './DocumentLink.module.scss';
import type { GenericDocument } from '../../../universal/types/App.types.ts';
import { captureException } from '../../helpers/monitoring.ts';
import { trackDownload } from '../../hooks/analytics.hook.ts';
import { HttpStatusCode } from '../../hooks/api/useBffApi.ts';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';
import { MaLink } from '../MaLink/MaLink.tsx';
import { Spinner } from '../Spinner/Spinner.tsx';

interface DocumentLinkProps {
  document: GenericDocument;
  label?: string;
  trackPath?: (document: GenericDocument) => string;
}

function downloadFile(document: GenericDocument) {
  const link = window.document.createElement('a');
  link.href = document.url;
  link.download = getDownloadName(document);
  link.click();
}

function getDownloadName(document: GenericDocument) {
  const DOT = '.';
  const DEFAULT_FILE_EXTENSION = 'pdf';

  if (document.download) {
    return document.download;
  }

  const name = document.filename || document.title;
  const downloadName = !name.includes(DOT)
    ? name + DOT + DEFAULT_FILE_EXTENSION
    : name;

  return downloadName;
}

export function DocumentLink({
  document,
  label,
  trackPath,
}: DocumentLinkProps) {
  const [isErrorVisible, setErrorVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const profileType = useProfileTypeValue();

  let documentTitle = document.title || 'Bestand';
  const extension = document.filename?.split('.')[1];
  if (extension) {
    documentTitle += `.${extension}`;
  }

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
            throw new Error(`Failed to download document. Code: ${res.status}`);
          }

          return res.blob();
        })
        .then((blob) => {
          const trackingUrl = trackPath
            ? trackPath(document)
            : `${window.location.pathname}/downloads/${getDownloadName(document)}`;

          const fileType = trackingUrl.split('.').pop();
          trackDownload(documentTitle, fileType, trackingUrl, profileType);

          if (!blob) {
            downloadFile(document);
          } else if (
            window.navigator &&
            (window.navigator as any).msSaveOrOpenBlob
          ) {
            (window.navigator as any).msSaveOrOpenBlob(blob, documentTitle);
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
              title: documentTitle,
              url: document.url,
            },
          });
          setErrorVisible(true);
        });
      return false;
    },
    [isLoading, document, trackPath, documentTitle, profileType]
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
              svg={isErrorVisible ? WarningIcon : DownloadIcon}
              size="heading-5"
            />
          )}
        </span>
        {label || documentTitle}
      </MaLink>
      {isLoading && <span className={styles.DownloadInfo}>Downloaden...</span>}
      {isErrorVisible && (
        <span className={styles.DownloadInfo}>Downloaden mislukt</span>
      )}
    </span>
  );
}

export const forTesting = {
  getDownloadName,
};
