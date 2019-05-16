import { AppRoutes, Colors } from 'App.constants';
import classnames from 'classnames';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import ButtonLinkStyles from 'components/ButtonLink/ButtonLink.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Heading from 'components/Heading/Heading';
import { defaultDateFormat } from 'helpers/App';
import { MyUpdate, useUpdatesState } from 'hooks/api/my-updates-api.hook';
import React from 'react';
import useRouter from 'use-react-router';

import styles from './MyUpdates.module.scss';

export interface MyUpdatesProps {
  items: MyUpdate[];
  total: number;
  showMoreLink?: boolean;
}

export default function MyUpdates({
  items = [],
  total = 0,
  showMoreLink = false,
}: MyUpdatesProps) {
  const [myUpdatesState, setMyUpdatesState] = useUpdatesState();
  const { history } = useRouter();

  function showUpdate(id: string, to: string) {
    setMyUpdatesState({
      ...myUpdatesState,
      [id]: true,
    });
    // NOTE: Add a timeout so state will be persisted before routing.
    setTimeout(() => {
      history.push(to);
    }, 0);
  }
  return (
    <div className={styles.MyUpdates}>
      <ul>
        {items.map(item => {
          return (
            <li
              key={item.id}
              className={classnames(
                styles.MyUpdateItem,
                item.isUnread && styles.isUnread
              )}
            >
              <ChapterIcon
                fill={Colors.primaryRed}
                className={styles.Icon}
                chapter={item.chapter}
              />
              <aside>
                <em className={styles.ChapterIndication}>
                  {item.chapter.toLowerCase()}
                </em>
                <time className={styles.Datum} dateTime={item.datePublished}>
                  {defaultDateFormat(item.datePublished)}
                </time>
              </aside>
              <Heading el="h4" size="small">
                {item.title}
              </Heading>
              {!!item.description && (
                <p className={styles.Description}>{item.description}</p>
              )}
              <p className={styles.Action}>
                <a
                  role="button"
                  className={ButtonLinkStyles.ButtonLink}
                  onClick={() => {
                    showUpdate(item.id, item.link.to);
                  }}
                >
                  {item.link.title}
                </a>
              </p>
            </li>
          );
        })}
      </ul>
      {showMoreLink && (
        <p className={styles.FooterLink}>
          <ButtonLink to={AppRoutes.MY_UPDATES}>Alle meldingen</ButtonLink>
        </p>
      )}
      {items.length === 0 && <p>Er zijn op het moment geen meldingen</p>}
    </div>
  );
}
