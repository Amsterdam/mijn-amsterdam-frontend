import { ReactComponent as DocumentIcon } from '../../assets/icons/Document.svg';
import { ReactComponent as DownloadIcon } from '../../assets/icons/Download.svg';
import Heading from '../Heading/Heading';
import React from 'react';
import { defaultDateFormat } from '../../../universal/helpers';
import styles from './DocumentList.module.scss';
import { trackDownload } from '../../hooks/analytics.hook';

export interface Document {
  id: string;
  title: string;
  url: string;
  type: string;
  datePublished: string;
}

export interface DocumentListProps {
  items: Document[];
}

export default function DocumentList({ items = [] }: DocumentListProps) {
  return (
    <div className={styles.DocumentList}>
      <ul>
        {items.map(item => {
          return (
            <li key={item.id} className={styles.DocumentListItem}>
              <aside className={styles.MetaInfo}>
                <em className={styles.TypeIndication}>{item.type}</em>
                <time className={styles.Datum} dateTime={item.datePublished}>
                  {defaultDateFormat(item.datePublished)}
                </time>
              </aside>
              <a
                className={styles.DownloadLink}
                href={item.url}
                onClick={() => trackDownload(item.url)}
              >
                <DocumentIcon aria-hidden="true" className={styles.Icon} />
                <Heading el="h4" size="small">
                  {item.title}{' '}
                  <DownloadIcon
                    aria-hidden="true"
                    className={styles.DownloadIcon}
                  />
                </Heading>
                <div className={styles.FileType}>PDF</div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
