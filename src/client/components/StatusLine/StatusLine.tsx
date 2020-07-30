import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import { defaultDateFormat } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconChevronLeft } from '../../assets/icons';
import { trackEvent } from '../../hooks/analytics.hook';
import { useSessionStorage } from '../../hooks/storage.hook';
import { Button } from '../Button/Button';
import DocumentList from '../DocumentList/DocumentList';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './StatusLine.module.scss';
import Heading from '../Heading/Heading';

export type StepType =
  | 'first-step'
  | 'last-step'
  | 'intermediate-step'
  | 'single-step';

export interface StatusLineItem {
  id: string;
  status: string;
  datePublished: string;
  description: string;
  documents: GenericDocument[];
  isActive?: boolean;
  isChecked?: boolean;
  isHighlight?: boolean;
  [key: string]: any;
}

type AltDocumentContent = string | JSX.Element;

interface StatusLinePanelProps {
  children: ComponentChildren;
  name?: string;
}

export function StatusLinePanel({ children, name }: StatusLinePanelProps) {
  const classNames = classnames(styles.Panel, name && styles[`Panel--${name}`]);
  return <div className={classNames}>{children}</div>;
}

interface StatusLinePanelStatusProps {
  datePublished?: string;
  status: string;
}

export function StatusLinePanelStatus({
  datePublished,
  status,
}: StatusLinePanelStatusProps) {
  return (
    <StatusLinePanel name="status">
      <strong className={styles.StatusTitle}>{status}</strong>
      {!!datePublished && (
        <time className={styles.StatusDate}>
          {defaultDateFormat(datePublished)}
        </time>
      )}
    </StatusLinePanel>
  );
}

interface StatusLinePanelDescriptionProps {
  content: string;
}

export function StatusLinePanelDescription({
  content,
}: StatusLinePanelDescriptionProps) {
  return (
    <StatusLinePanel name="description">
      <InnerHtml className={styles.PanelContent}>{content}</InnerHtml>
    </StatusLinePanel>
  );
}

interface StatusLinePanelDocumentsProps {
  documents: GenericDocument[];
  altDocumentContent?: AltDocumentContent;
}

export function StatusLinePanelDocuments({
  documents,
  altDocumentContent,
}: StatusLinePanelDocumentsProps) {
  return (
    <StatusLinePanel name="documents">
      {!!altDocumentContent && (
        <span className={styles.altDocumentContent}>{altDocumentContent}</span>
      )}
      {!!documents.length && <DocumentList documents={documents} />}
    </StatusLinePanel>
  );
}

interface StatusLineItemProps {
  children: ComponentChildren;
  highlight?: boolean;
  style?: CSSProperties;
}

export function StatusLineItem({
  children,
  highlight = false,
  style,
}: StatusLineItemProps) {
  return (
    <li
      style={style ? style : {}}
      className={classnames(
        styles.ListItem,
        highlight && styles['ListItem--highlight']
      )}
    >
      <div className={styles.ListItemInner}>{children}</div>
    </li>
  );
}

interface ToggleMoreProps {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

export function ToggleMore({ isCollapsed, toggleCollapsed }: ToggleMoreProps) {
  return (
    <Button
      className={classnames(styles.MoreStatus, {
        [styles.MoreStatusClosed]: isCollapsed,
      })}
      onClick={toggleCollapsed}
      icon={IconChevronLeft}
      variant="plain"
      aria-expanded={!isCollapsed}
      lean={true}
    >
      {isCollapsed ? 'Toon alles' : 'Toon minder'}
    </Button>
  );
}

interface StatusLineConnectionProps {
  index: number;
  total: number;
  max?: number;
  isActive: boolean;
  isChecked: boolean;
}

function StatusLineConnection({
  index,
  total,
  max,
  isChecked,
  isActive,
}: StatusLineConnectionProps) {
  const isEnd =
    (typeof max !== 'undefined' && index === max - 1) ||
    (typeof max === 'undefined' && index === total - 1);

  if (max === -1) {
    return (
      <div className={styles.StatusConnection}>
        <span
          className={classnames(
            styles.Checkmark,
            isActive && styles['Checkmark--active'],
            isChecked && styles['Checkmark--checked']
          )}
        />
      </div>
    );
  } else if (index === 0) {
    return (
      <div className={styles.StatusConnection}>
        <span
          className={classnames(
            styles.ConnectLine,
            isChecked && !isActive && total > 1
              ? styles['ConnectLine--start-checked']
              : styles['ConnectLine--start']
          )}
        />
        <span
          className={classnames(
            styles.Checkmark,
            isActive && styles['Checkmark--active'],
            isChecked && styles['Checkmark--checked']
          )}
        />
      </div>
    );
  } else if (!isEnd && isActive) {
    return (
      <div className={styles.StatusConnection}>
        <span
          className={classnames(
            styles.ConnectLine,
            styles['ConnectLine--middle-checked-next']
          )}
        />
        <span
          className={classnames(
            styles.Checkmark,
            isActive && styles['Checkmark--active'],
            isChecked && styles['Checkmark--checked']
          )}
        />
      </div>
    );
  } else if (isEnd) {
    return (
      <div className={styles.StatusConnection}>
        <span
          className={classnames(
            styles.ConnectLine,
            isActive && styles['ConnectLine--end-active'],
            isChecked
              ? styles['ConnectLine--end-checked']
              : styles['ConnectLine--end']
          )}
        />
        <span
          className={classnames(
            styles.Checkmark,
            isActive && styles['Checkmark--active'],
            isChecked && styles['Checkmark--checked']
          )}
        />
      </div>
    );
  }
  return (
    <div className={styles.StatusConnection}>
      <span
        className={classnames(
          styles.ConnectLine,
          isChecked && styles['ConnectLine--checked']
        )}
      />
      <span
        className={classnames(
          styles.Checkmark,
          isActive && styles['Checkmark--active'],
          isChecked && styles['Checkmark--checked']
        )}
      />
    </div>
  );
}

interface StatusLineProps {
  items: StatusLineItem[];
  trackCategory: string;
  altDocumentContent?: AltDocumentContent;
  id?: string;
  showToggleMore?: boolean;
  statusLabel?: string;
  className?: string;
  maxStepCount?: number | -1; // Supply -1 if you want to treat each step as a single, not connected step
  highlightKey?: string | false; // key of data item which corresponding value is cast to a boolean and controls wether this item gets the highlight class
}

export default function StatusLine({
  items,
  trackCategory,
  showToggleMore = true,
  statusLabel = 'Status',
  className,
  id,
  maxStepCount,
  highlightKey = 'isActive',
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
        <Heading size="tiny" el="h4" className={styles.ListHeading}>
          {statusLabel}
        </Heading>
        {!!items.length && (
          <ul className={styles.List}>
            {items.map((item, index) => (
              <StatusLineItem
                key={`step-${item.status}-${index}`}
                highlight={highlightKey ? !!item[highlightKey] : false}
                style={{
                  display: showToggleMore
                    ? !isCollapsed || (isCollapsed && item.isActive)
                      ? 'block'
                      : 'none'
                    : 'block',
                }}
              >
                <StatusLineConnection
                  index={index}
                  total={items.length}
                  max={maxStepCount}
                  isActive={Boolean(item.isActive)}
                  isChecked={Boolean(item.isChecked)}
                />
                <StatusLinePanelStatus
                  datePublished={item.datePublished}
                  status={item.status}
                />
                <StatusLinePanelDescription content={item.description} />
                <StatusLinePanelDocuments
                  documents={item.documents}
                  altDocumentContent={item.altDocumentContent}
                />
              </StatusLineItem>
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
