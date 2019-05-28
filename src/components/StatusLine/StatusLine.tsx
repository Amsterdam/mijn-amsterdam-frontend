import React, { useMemo, useEffect, useState } from 'react';
import styles from './StatusLine.module.scss';
import classnames from 'classnames';
import { ProcessStep } from 'data-formatting/focus';
import {
  IconButtonLink,
  ButtonLinkExternal,
} from 'components/ButtonLink/ButtonLink';
import { Document } from '../DocumentList/DocumentList';
import { ReactComponent as DownloadIcon } from 'assets/icons/Download.svg';
import { defaultDateFormat } from 'helpers/App';
import useRouter from 'use-react-router';
import { useSessionStorage } from 'hooks/storage.hook';

const markdownLinkRegex = /\[((?:[^\[\]\\]|\\.)+)\]\((https?:\/\/(?:[-A-Z0-9+&@#\/%=~_|\[\]](?= *\))|[-A-Z0-9+&@#\/%?=~_|\[\]!:,.;](?! *\))|\([-A-Z0-9+&@#\/%?=~_|\[\]!:,.;(]*\))+) *\)/i;
const markdownTagMatchRegex = /(\[.*?\]\(.*?\))/gi;

export type StatusLineItem = ProcessStep;

interface StatusLineProps {
  items: StatusLineItem[];
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
      target="_blank"
      className={styles.DownloadLink}
      to={item.url}
    >
      <DownloadIcon />
      {item.title}
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

function StatusLineItem({ item, stepNumber }: StatusLineItemProps) {
  const { location } = useRouter();
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
      id={item.id}
      className={classnames(
        styles.ListItem,
        item.isActual && styles.Actual,
        location.hash.substring(1) === item.id && styles.Highlight
      )}
    >
      <div className={styles.Panel} data-stepnumber={stepNumber}>
        <strong className={styles.StatusTitle}>{item.status}</strong>
        <time className={styles.StatusDate}>
          {defaultDateFormat(item.datePublished)}
        </time>
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
    const step = document.getElementById(id);

    if (step) {
      window.scroll({
        top: step.getBoundingClientRect().top,
        behavior: 'smooth',
      });
    }
  }, [location.hash]);

  return (
    <div className={styles.StatusLine}>
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
      {!items.length && <p>Er is geen status beschikbaar.</p>}
      {items.length > 1 && (
        <button
          className={classnames(
            styles.MoreStatus,
            isCollapsed && styles.isCollapsed
          )}
          onClick={toggleCollapsed}
        >
          {isCollapsed ? 'Lees meer' : 'Lees minder'} <span>▶</span>
        </button>
      )}
    </div>
  );
}
