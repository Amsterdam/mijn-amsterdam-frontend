import classnames from 'classnames';
import { PropsWithChildren } from 'react';
import { defaultDateFormat } from '../../../universal/helpers';
import { AltDocumentContent, GenericDocument } from '../../../universal/types';
import DocumentList from '../DocumentList/DocumentList';
import InnerHtml from '../InnerHtml/InnerHtml';
import styles from './InboxView.module.scss';

export type InboxLineItemPanelProps = PropsWithChildren<{
  name?: string;
}>;

export function InboxLineItemPanel({
  children,
  name,
}: InboxLineItemPanelProps) {
  const classNames = classnames(styles.Panel, name && styles[`Panel--${name}`]);
  return <div className={classNames}>{children}</div>;
}

interface InboxLineItemPanelStatusProps {
  datePublished?: string;
  status: string;
}

export function InboxLineItemPanelStatus({
  datePublished,
  status,
}: InboxLineItemPanelStatusProps) {
  return (
    <InboxLineItemPanel name="status">
      <strong className={styles.InboxViewLineItemTitle}>{status}</strong>
      {!!datePublished && (
        <time className={styles.InboxViewLineItemDate}>
          {defaultDateFormat(datePublished)}
        </time>
      )}
    </InboxLineItemPanel>
  );
}

interface InboxLineItemPanelDescriptionProps {
  content: string;
}

export function InboxLineItemPanelDescription({
  content,
}: InboxLineItemPanelDescriptionProps) {
  return (
    <InboxLineItemPanel name="description">
      <InnerHtml className={styles.PanelContent}>{content}</InnerHtml>
    </InboxLineItemPanel>
  );
}

interface InboxLineItemPanelDocumentsProps {
  documents: GenericDocument[];
  altDocumentContent?: AltDocumentContent;
  trackPath?: (document: GenericDocument) => string;
}

export function InboxLineItemPanelDocuments({
  documents,
  altDocumentContent,
  trackPath,
}: InboxLineItemPanelDocumentsProps) {
  return (
    <InboxLineItemPanel name="documents">
      {!!altDocumentContent && typeof altDocumentContent === 'string' ? (
        <InnerHtml el="span" className={styles.altDocumentContent}>
          {altDocumentContent}
        </InnerHtml>
      ) : (
        altDocumentContent
      )}
      {!!documents.length && (
        <DocumentList documents={documents} trackPath={trackPath} />
      )}
    </InboxLineItemPanel>
  );
}

export interface InboxItem {
  datePublished: string;
  status: string;
  description: string;
  documents: GenericDocument[];
  altDocumentContent?: AltDocumentContent;
}

export type InboxViewLineItemProps = PropsWithChildren<{}>;

function InboxViewLineItem({ children }: InboxViewLineItemProps) {
  return (
    <li className={styles.InboxViewLineItem}>
      <div className={styles.InboxViewLineItemInner}>{children}</div>
    </li>
  );
}

export type InboxViewListProps = PropsWithChildren<{}>;

function InboxViewList({ children }: InboxViewListProps) {
  return <ul className={styles.InboxViewList}>{children}</ul>;
}

export interface InboxViewProps {
  items: InboxItem[];
  className?: string;
  documentPathForTracking?: (document: GenericDocument) => string;
}

export function InboxView({
  items = [],
  documentPathForTracking,
  className,
}: InboxViewProps) {
  return (
    <div className={classnames(styles.InboxView, className)}>
      <InboxViewList>
        {items.map((item) => (
          <InboxViewLineItem key={item.status + item.datePublished}>
            <InboxLineItemPanelStatus
              datePublished={item.datePublished}
              status={item.status}
            />
            <InboxLineItemPanelDescription content={item.description} />
            <InboxLineItemPanelDocuments
              documents={item.documents}
              altDocumentContent={item.altDocumentContent}
              trackPath={documentPathForTracking}
            />
          </InboxViewLineItem>
        ))}
      </InboxViewList>
    </div>
  );
}
