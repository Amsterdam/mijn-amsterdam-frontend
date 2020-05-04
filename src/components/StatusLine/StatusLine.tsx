import React, { useMemo, CSSProperties } from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import Linkd, { Button } from 'components/Button/Button';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import { defaultDateFormat } from 'helpers/App';
import { useSessionStorage } from 'hooks/storage.hook';
import { trackEvent } from 'hooks/analytics.hook';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';

export type StepType =
  | 'first-step'
  | 'last-step'
  | 'intermediate-step'
  | 'single-step';

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
  id: string;
  showToggleMore?: boolean;
  statusLabel?: string;
  className?: string;
}

interface StatusLineItemProps {
  item: StatusLineItem;
  stepNumber: number;
  altDocumentContent?: AltDocumentContent | ConditionalAltDocumentContent;
  style?: CSSProperties;
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
      external={true}
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
  style,
}: StatusLineItemProps) {
  const altDocumentContentActual = useMemo(() => {
    return typeof altDocumentContent === 'function'
      ? altDocumentContent(item, stepNumber)
      : altDocumentContent;
  }, [altDocumentContent, item, stepNumber]);

  return (
    <li
      style={style ? style : {}}
      key={item.id}
      id={item.id}
      className={classnames(
        styles.ListItem,
        item.isLastActive && styles['last-step-active'],
        item.isChecked && styles['checked-step'],
        item.stepType && styles[item.stepType]
      )}
    >
      <div className={styles.ListItemInner}>
        <div
          className={classnames(styles.Panel, styles['Panel--status'])}
          data-stepnumber={stepNumber}
        >
          <strong className={styles.StatusTitle}>{item.status}</strong>
          <time className={styles.StatusDate}>
            {defaultDateFormat(item.datePublished)}
          </time>
        </div>
        <div className={classnames(styles.Panel, styles['Panel--description'])}>
          {item.description}
        </div>
        <div className={classnames(styles.Panel, styles['Panel--documents'])}>
          {!!altDocumentContentActual && (
            <span className={styles.altDocumentContent}>
              {altDocumentContentActual}
            </span>
          )}
          {!!item.documents.length && (
            <ul className={styles.DocumentDownloadItems}>
              {item.documents.map(document => (
                <li key={document.id}>
                  <DownloadLink key={document.id} item={document} />
                </li>
              ))}
            </ul>
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
      aria-expanded={!isCollapsed}
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
  showToggleMore,
  statusLabel = 'Status',
  className,
  id,
}: StatusLineProps) {
  const [isCollapsed, setCollapsed] = useSessionStorage(
    'STATUS_LINE_' + id,
    showToggleMore
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

  return (
    <>
      {showToggleMore && items.length > 1 && (
        <ToggleMore
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
      )}
      <div className={classnames(styles.StatusLine, className)}>
        <h4 className={styles.ListHeading}>{statusLabel}</h4>
        {!!items.length && (
          <ul className={styles.List}>
            {items.map((item, index) => (
              <StatusLineItem
                style={{
                  display:
                    !isCollapsed || (isCollapsed && item.isLastActive)
                      ? 'block'
                      : 'none',
                }}
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
      {showToggleMore && items.length > 1 && (
        <ToggleMore
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
      )}
    </>
  );
}
