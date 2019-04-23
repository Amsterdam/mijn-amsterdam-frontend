import React from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import { ProcessStep } from 'data-formatting/focus';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import ButtonLink from '../ButtonLink/ButtonLink';
import { LinkProps } from 'App.types';

type StatusLineItem = ProcessStep;

interface StatusLineProps {
  items: StatusLineItem[];
}

interface StatusLineItemProps {
  item: StatusLineItem;
}

interface DownloadLinkProps {
  item: Document;
}

function DownloadLink({ item }: DownloadLinkProps) {
  return (
    <IconButtonLink className={styles.DownloadLink} to={item.url}>
      <DownloadIcon />
      {item.title}
    </IconButtonLink>
  );
}

function StatusLineItem({ item }: StatusLineItemProps) {
  return (
    <li
      key={item.id}
      className={classnames(
        styles.ListItem,
        item.isActual && styles.ListItem__actual
      )}
    >
      <div className={styles.Panel}>
        <strong className={styles.StatusTitle}>{item.title}</strong>
        <time className={styles.StatusDate}>{item.datePublished}</time>
      </div>
      <div className={styles.Panel}>
        {item.description &&
          item.description
            .split(/\\n/)
            .map((text, index) => <p key={index}>{text}</p>)}
        {!!item.infoLink &&
          ([] as LinkProps[]).concat(item.infoLink).map(infoLink => (
            <p>
              <ButtonLink to={infoLink.to} target={infoLink.target}>
                {infoLink.title}
              </ButtonLink>
            </p>
          ))}
      </div>
      <div className={styles.Panel}>
        <p>
          {item.documents.map(document => (
            <DownloadLink key={document.id} item={document} />
          ))}
        </p>
      </div>
    </li>
  );
}

export default function StatusLine({ items }: StatusLineProps) {
  return (
    <div className={styles.StatusLine}>
      <ul className={styles.List}>
        {items.map(item => (
          <StatusLineItem key={item.id} item={item} />
        ))}
      </ul>
      {!items.length && <p>Er is geen status beschikbaar.</p>}
    </div>
  );
}
