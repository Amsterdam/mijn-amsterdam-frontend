import React, { useMemo } from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import { ProcessStep } from 'data-formatting/focus';
import {
  IconButtonLink,
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import ButtonLink from '../ButtonLink/ButtonLink';
import { LinkProps } from 'App.types';

const markdownLinkRegex = /\[((?:[^\[\]\\]|\\.)+)\]\((https?:\/\/(?:[-A-Z0-9+&@#\/%=~_|\[\]](?= *\))|[-A-Z0-9+&@#\/%?=~_|\[\]!:,.;](?! *\))|\([-A-Z0-9+&@#\/%?=~_|\[\]!:,.;(]*\))+) *\)/i;
const markdownTagMatchRegex = /(\[.*?\]\(.*?\))/gi;

export type StatusLineItem = ProcessStep;

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
    <IconButtonLink
      target="_blank"
      className={styles.DownloadLink}
      to={item.url}
    >
      <DownloadIcon />
      Bekijk brief
    </IconButtonLink>
  );
}

function parseDescription(text: string, item: any) {
  const linkTags = text.split(markdownTagMatchRegex);
  if (linkTags) {
    return linkTags.map(link => {
      const tagParts = link.match(markdownLinkRegex);
      if (tagParts) {
        const [, text, url] = tagParts;
        return (
          <ButtonLinkExternal key={url} to={url}>
            {text}
          </ButtonLinkExternal>
        );
      }
      return link;
    });
  }
  return text.split(/\n/g).map(text => [text, <br />]);
}

function StatusLineItem({ item }: StatusLineItemProps) {
  const memoizedDescription = useMemo(() => {
    return (
      item.description &&
      item.description
        .split(/\n\n/g)
        .map((text, index) => <p key={index}>{parseDescription(text, item)}</p>)
    );
  }, [item]);
  return (
    <li
      key={item.id}
      className={classnames(
        styles.ListItem,
        item.isActual && styles.ListItem__actual
      )}
    >
      <div className={styles.Panel}>
        <strong className={styles.StatusTitle}>{item.status}</strong>
        <time className={styles.StatusDate}>{item.datePublished}</time>
      </div>
      <div className={styles.Panel}>{memoizedDescription}</div>
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
