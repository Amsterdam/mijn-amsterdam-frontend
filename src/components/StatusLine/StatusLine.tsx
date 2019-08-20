import React, { useEffect } from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import { defaultDateFormat } from 'helpers/App';
import useRouter from 'use-react-router';
import { useSessionStorage } from 'hooks/storage.hook';
import { itemClickTogglePayload } from 'hooks/analytics.hook';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';

const DEFAULT_TRACK_CATEGORY = 'Metro_lijn';
export type StepType = 'first-step' | 'last-step' | 'middle-step';
export interface StatusLineItem {
  id: string;
  status: string;
  stepType: StepType;
  datePublished: string;
  description: string | JSX.Element;
  documents: Document[];
  isActual: boolean;
}

interface StatusLineProps {
  items: StatusLineItem[];
  trackCategory?: string;
}

interface StatusLineItemProps {
  item: StatusLineItem;
  stepNumber: number;
}

interface DownloadLinkProps {
  item: Document;
}

function DownloadLink({ item }: DownloadLinkProps) {
  return (
    <IconButtonLink
      className={styles.DownloadLink}
      to={item.url}
      rel="external nofollow"
      download={item.title}
    >
      <DownloadIcon aria-hidden="true" />
      {item.title}
    </IconButtonLink>
  );
}

function StatusLineItem({ item, stepNumber }: StatusLineItemProps) {
  const { location } = useRouter();

  return (
    <li
      key={item.id}
      id={item.id}
      className={classnames(
        styles.ListItem,
        item.isActual && styles.Actual,
        location.hash.substring(1) === item.id && styles.Highlight,
        item.stepType && styles[item.stepType]
      )}
    >
      <div className={styles.ListItemInner}>
        <div className={styles.Panel} data-stepnumber={stepNumber}>
          <strong className={styles.StatusTitle}>{item.status}</strong>
          <time className={styles.StatusDate}>
            {defaultDateFormat(item.datePublished)}
          </time>
        </div>
        <div className={styles.Panel}>{item.description}</div>
        <div className={styles.Panel}>
          <p>
            {item.documents.map(document => (
              <DownloadLink key={document.id} item={document} />
            ))}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function StatusLine({
  items,
  trackCategory = DEFAULT_TRACK_CATEGORY,
}: StatusLineProps) {
  const { location } = useRouter();
  const [isCollapsed, setCollapsed] = useSessionStorage(
    'STATUS_LINE_' + location.pathname,
    true
  );

  function toggleCollapsed() {
    setCollapsed(!isCollapsed);
  }

  useEffect(() => {
    const id = location.hash.substring(1);
    const step = id && document.getElementById(id);

    if (step) {
      window.scroll({
        top: step.getBoundingClientRect().top,
        behavior: 'smooth',
      });
    }
  }, [location.hash]);

  return (
    <>
      <div className={styles.StatusLine}>
        {!!items.length && (
          <ul className={styles.List}>
            {items
              .filter(
                (item, index) =>
                  !isCollapsed || (isCollapsed && index === items.length - 1)
              )
              .map((item, index) => (
                <StatusLineItem
                  key={item.id}
                  item={item}
                  stepNumber={items.length - index}
                />
              ))}
          </ul>
        )}
        {!items.length && (
          <p className={styles.NoStatusItems}>Er is geen status beschikbaar.</p>
        )}
      </div>
      {items.length > 1 && (
        <button
          className={classnames(styles.MoreStatus, {
            [styles.MoreStatusClosed]: isCollapsed,
          })}
          data-track={itemClickTogglePayload(
            `${trackCategory}/MetroLijn`,
            'Toon alles/minder',
            isCollapsed ? 'alles' : 'minder'
          )}
          onClick={toggleCollapsed}
        >
          <CaretLeft aria-hidden="true" />
          {isCollapsed ? 'Toon alles' : 'Toon minder'}
        </button>
      )}
    </>
  );
}
