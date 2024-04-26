import classnames from 'classnames';
import { useCallback, useState } from 'react';
import { GenericDocument } from '../../../universal/types';
import { IconAlert, IconDownload } from '../../assets/icons';
import { Colors } from '../../config/app';
import { trackDownload, useProfileTypeValue } from '../../hooks';
import { useUserCity } from '../../hooks/useUserCity';
import Linkd from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import styles from './DocumentLink.module.scss';
import { captureException } from '../../utils/monitoring';

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
  const userCity = useUserCity();

  const onClickDocumentLink = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      if (isLoading) {
        return false;
      }
      setLoading(true);

      if (!('fetch' in window) || document?.external) {
        downloadFile(document);
        return;
      }

      // First check to see if the request will succeed or not.
      fetch(document.url, { credentials: 'include' })
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
              addFileType(`/downloads/${document.download || document.title}`);

          const fileType = trackingUrl.split('.').pop();

          trackDownload(
            document.title,
            fileType,
            trackingUrl,
            profileType,
            userCity ?? ''
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
    [document, profileType, isLoading, trackPath, userCity]
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
