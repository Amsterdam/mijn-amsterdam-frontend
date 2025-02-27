import { CSSProperties } from 'react';

import { ActionGroup, Heading, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';

import styles from './StatusLine.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { ComponentChildren, LinkProps } from '../../../universal/types';
import {
  AltDocumentContent,
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types';
import DocumentListV2 from '../DocumentList/DocumentListV2';
import InnerHtml from '../InnerHtml/InnerHtml';
import { MaButtonLink } from '../MaLink/MaLink';

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
  content?: string;
  actionButtonItems?: LinkProps[];
}

export function StatusLinePanelDescription({
  content = '',
  actionButtonItems = [],
}: StatusLinePanelDescriptionProps) {
  const actionButtons = actionButtonItems.length > 0 && (
    <ActionGroup className={styles.PanelActionGroup}>
      {actionButtonItems.map(({ to, title }) => (
        <MaButtonLink key={to} href={to} variant="secondary">
          {title}
          <Icon svg={ExternalLinkIcon} size="level-5" />
        </MaButtonLink>
      ))}
    </ActionGroup>
  );
  return (
    <StatusLinePanel name="description">
      <InnerHtml className={styles.PanelContent}>{content}</InnerHtml>
      {actionButtons}
    </StatusLinePanel>
  );
}

interface StatusLinePanelDocumentsProps {
  documents: GenericDocument[];
  altDocumentContent?: AltDocumentContent;
  trackPath?: (document: GenericDocument) => string;
}

export function StatusLinePanelDocuments({
  documents = [],
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
        <DocumentListV2 documents={documents} trackPath={trackPath} />
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

function StatusLineConnectionPlaceholder() {
  return <div className={styles.StatusConnection} />;
}

interface StatusLineConnectionProps {
  index: number;
  total: number;
  isActive: boolean;
  isChecked: boolean;
}

function StatusLineConnection({
  index,
  total,
  isChecked,
  isActive,
}: StatusLineConnectionProps) {
  const maxIndex = total - 1;
  const isEnd = maxIndex !== -1 ? index === maxIndex : false;

  let status = null;
  let ariaLabel = 'Toekomstige status, nog niet aangevinkt.';
  switch (true) {
    case isActive:
      ariaLabel = 'Huidige status, aangevinkt.';
      break;
    case isChecked:
      ariaLabel = 'Status aangevinkt.';
      break;
  }

  if (total === 1) {
    status = (
      <span
        className={classnames(
          styles.Checkmark,
          isActive && styles['Checkmark--active'],
          isChecked && styles['Checkmark--checked']
        )}
      />
    );
  }

  if (total > 1) {
    if (index === 0) {
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
  }
  return (
    <div aria-label={ariaLabel} className={styles.StatusConnection}>
      {status}
    </div>
  );
}

interface StatusLineProps {
  items: StatusLineItem[];
  // Deprecated
  trackCategory?: string;
  altDocumentContent?: AltDocumentContent;
  // Deprecated
  id?: string;
  statusLabel?: string;
  showStatusLineConnection?: boolean;
  className?: string;
}

export default function StatusLine({
  items,
  statusLabel = 'Status',
  className,
  showStatusLineConnection = true,
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
              highlight={item.isActive}
            >
              {showStatusLineConnection === true ? (
                <StatusLineConnection
                  index={index}
                  total={items.length}
                  isActive={item.isActive}
                  isChecked={item.isChecked}
                />
              ) : (
                <>
                  <StatusLineConnectionPlaceholder />
                </>
              )}

              <StatusLinePanelStatus
                datePublished={item.datePublished}
                status={item.status}
              />

              <StatusLinePanelDescription
                content={item.description}
                actionButtonItems={item.actionButtonItems}
              />

              <StatusLinePanelDocuments
                documents={item.documents ?? []}
                altDocumentContent={item.altDocumentContent}
              />
            </LineItem>
          ))}
        </ul>
      )}
      {!items.length && (
        <Paragraph className={styles.NoStatusItems}>
          Er is geen status beschikbaar.
        </Paragraph>
      )}
    </div>
  );
}
