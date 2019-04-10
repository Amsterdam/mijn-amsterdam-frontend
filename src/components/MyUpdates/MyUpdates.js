import React from 'react';
import styles from './MyUpdates.module.scss';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import { defaultDateFormat } from 'helpers/App';
import { AppRoutes, Colors } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Heading from 'components/Heading/Heading';

export default function MyUpdates({ items = [], total = 0 }) {
  return (
    <div className={styles.MyUpdates}>
      <ul>
        {items.map(item => {
          return (
            <li
              key={item.title + item.datePublished}
              className={styles.MyUpdateItem}
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
                <ButtonLink to={item.link.to}>{item.link.title}</ButtonLink>
              </p>
            </li>
          );
        })}
      </ul>
      {total > items.length && (
        <p className={styles.FooterLink}>
          <ButtonLink to={AppRoutes.MY_UPDATES}>Alle updates</ButtonLink>
        </p>
      )}
    </div>
  );
}
