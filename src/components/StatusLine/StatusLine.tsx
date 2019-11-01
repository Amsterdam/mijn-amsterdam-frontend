import React, { useEffect, useMemo } from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import Linkd, { Button } from 'components/Button/Button';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import { defaultDateFormat } from 'helpers/App';
import useRouter from 'use-react-router';
import { useSessionStorage } from 'hooks/storage.hook';
import { trackEvent } from 'hooks/analytics.hook';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';

export type StepType = 'first-step' | 'last-step' | 'intermediate-step';
export interface StatusLineItem {
  id: string;
  status: string;
  stepType: StepType;
  datePublished: string;
  description: string | JSX.Element;
  documents: Document[];
  isLastActive: boolean;
  isChecked: boolean;
  [key: string]: any;
}

type AltDocumentContent = string | JSX.Element;
type ConditionalAltDocumentContent = (
  statusLineItem: StatusLineItem,
  stepNumber: number
) => AltDocumentContent;

interface StatusLineProps {
  items: StatusLineItem[];
  trackCategory: string;
  altDocumentContent?: AltDocumentContent | ConditionalAltDocumentContent;
}

interface StatusLineItemProps {
  item: StatusLineItem;
  stepNumber: number;
  altDocumentContent?: AltDocumentContent | ConditionalAltDocumentContent;
}

interface DownloadLinkProps {
  item: Document;
}

interface ToggleMoreProps {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

function DownloadLink({ item }: DownloadLinkProps) {
  return (
    <Linkd
      className={styles.DownloadLink}
      href={item.url}
      rel="external nofollow"
      download={item.title}
      icon={DownloadIcon}
    >
      {item.title}
    </Linkd>
  );
}

function StatusLineItem({
  item,
  stepNumber,
  altDocumentContent,
}: StatusLineItemProps) {
  const altDocumentContentActual = useMemo(() => {
    return typeof altDocumentContent === 'function'
      ? altDocumentContent(item, stepNumber)
      : altDocumentContent;
  }, []);
  return (
    <li
      key={item.id}
      id={item.id}
      className={classnames(
        styles.ListItem,
        item.isLastActive && styles.LastActive,
        item.isChecked && styles.Checked,
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
          {!!altDocumentContentActual && (
            <span className={styles.altDocumentContent}>
              {altDocumentContentActual}
            </span>
          )}
          {!!item.documents && (
            <p>
              {item.documents.map(document => (
                <DownloadLink key={document.id} item={document} />
              ))}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function ToggleMore({ isCollapsed, toggleCollapsed }: ToggleMoreProps) {
  return (
    <Button
      className={classnames(styles.MoreStatus, {
        [styles.MoreStatusClosed]: isCollapsed,
      })}
      onClick={toggleCollapsed}
      icon={CaretLeft}
      variant="plain"
      lean={true}
    >
      {isCollapsed ? 'Toon alles' : 'Toon minder'}
    </Button>
  );
}

export default function StatusLine({
  items,
  trackCategory,
  altDocumentContent,
}: StatusLineProps) {
  const { location } = useRouter();
  const [isCollapsed, setCollapsed] = useSessionStorage(
    'STATUS_LINE_' + location.pathname,
    true
  );

  function toggleCollapsed() {
    if (isCollapsed) {
      trackEvent({
        category: trackCategory,
        name: 'Metrolijn',
        action: 'Alles tonen',
      });
    }
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
      {items.length > 1 && (
        <ToggleMore
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
      )}
      <div className={styles.StatusLine}>
        <h4 className={styles.ListHeading}>Status</h4>
        {!!items.length && (
          <ul className={styles.List}>
            {items
              .filter(
                (item, index) =>
                  !isCollapsed || (isCollapsed && item.isLastActive)
              )
              .map((item, index) => (
                <StatusLineItem
                  key={item.id}
                  item={item}
                  stepNumber={index + 1}
                  altDocumentContent={altDocumentContent}
                />
              ))}
          </ul>
        )}
        {!items.length && (
          <p className={styles.NoStatusItems}>Er is geen status beschikbaar.</p>
        )}
      </div>
      {items.length > 1 && (
        <ToggleMore
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
      )}
    </>
  );
}
