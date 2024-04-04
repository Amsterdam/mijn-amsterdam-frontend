import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { CSSProperties } from 'react';
import { defaultDateFormat } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types';
import { GenericDocument } from '../../../universal/types/App.types';
import { IconChevronLeft } from '../../assets/icons';
import { Button } from '../Button/Button';
import DocumentList from '../DocumentList/DocumentList';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './StatusLine.module.scss';
import { AltDocumentContent, StatusLineItem } from './StatusLine.types';

// Types used to be in this file
export * from './StatusLine.types';

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
  trackPath?: (document: GenericDocument) => string;
}

export function StatusLinePanelDocuments({
  documents,
  altDocumentContent,
  trackPath,
}: StatusLinePanelDocumentsProps) {
  return (
    <StatusLinePanel name="documents">
      {!!altDocumentContent && typeof altDocumentContent === 'string' ? (
        <InnerHtml el="span" className={styles.altDocumentContent}>
          {altDocumentContent}
        </InnerHtml>
      ) : (
        altDocumentContent
      )}
      {!!documents?.length && (
        <DocumentList documents={documents} trackPath={trackPath} />
      )}
    </StatusLinePanel>
  );
}

interface StatusLineItemProps {
  children: ComponentChildren;
  highlight?: boolean;
  style?: CSSProperties;
}

export function LineItem({
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

function StatusLineConnectionPlaceholder() {
  return <div className={styles.StatusConnection} />;
}

interface StatusLineConnectionProps {
  index: number;
  total: number;
  max?: number | -1;
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

  let status = null;

  if (max === -1) {
    status = (
      <span
        className={classnames(
          styles.Checkmark,
          isActive && styles['Checkmark--active'],
          isChecked && styles['Checkmark--checked']
        )}
      />
    );
  } else if (index === 0) {
    status = (
      <>
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
      </>
    );
  } else if (!isEnd && isActive) {
    status = (
      <>
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
      </>
    );
  } else if (isEnd) {
    status = (
      <>
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
      </>
    );
  } else {
    status = (
      <>
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
      </>
    );
  }
  return (
    <div
      aria-label="Vinkje, processtap gereed"
      className={styles.StatusConnection}
    >
      {status}
    </div>
  );
}

interface StatusLineProps {
  items: StatusLineItem[];
  // @Deprecated
  trackCategory?: string;
  altDocumentContent?: AltDocumentContent;
  // @Deprecated
  id?: string;
  statusLabel?: string;
  showStatusLineConnection?: boolean;
  className?: string;
  maxStepCount?: number | -1; // Supply -1 if you want to treat each step as a single, not connected step
  highlightKey?: string | false; // key of data item which corresponding value is cast to a boolean and controls wether this item gets the highlight class.
  documentPathForTracking?: (document: GenericDocument) => string;
}

export default function StatusLine({
  items,
  trackCategory,
  statusLabel = 'Status',
  className,
  id,
  maxStepCount,
  highlightKey = 'isActive',
  showStatusLineConnection = true,
  documentPathForTracking,
}: StatusLineProps) {
  return (
    <div className={classnames(styles.StatusLine, className)}>
      <Heading level={4} size="level-4" className={styles.ListHeading}>
        {statusLabel}
      </Heading>
      {!!items.length && (
        <ul className={styles.List}>
          {items.map((item, index) => (
            <LineItem
              key={`step-${item.id}-${index}`}
              highlight={highlightKey ? !!item[highlightKey] : false}
            >
              {!!showStatusLineConnection ? (
                <StatusLineConnection
                  index={index}
                  total={items.length}
                  max={maxStepCount}
                  isActive={Boolean(item.isActive)}
                  isChecked={Boolean(item.isChecked)}
                />
              ) : (
                <StatusLineConnectionPlaceholder />
              )}

              <StatusLinePanelStatus
                datePublished={item.datePublished}
                status={item.status}
              />

              <StatusLinePanelDescription content={item.description ?? ''} />

              <StatusLinePanelDocuments
                documents={item.documents}
                altDocumentContent={item.altDocumentContent}
                trackPath={documentPathForTracking}
              />
            </LineItem>
          ))}
        </ul>
      )}
      {!items.length && (
        <p className={styles.NoStatusItems}>Er is geen status beschikbaar.</p>
      )}
    </div>
  );
}
