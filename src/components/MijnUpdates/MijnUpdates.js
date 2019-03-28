import React from 'react';
import styles from './MijnUpdates.module.scss';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import { defaultDateFormat } from 'helpers/App';
import { AppRoutes, Colors } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default function MijnUpdates({ items, total }) {
  return (
    <div className={styles.MijnUpdates}>
      <ul>
        {items.map(item => {
          return (
            <li key={item.title} className={styles.MijnUpdateItem}>
              <ChapterIcon
                fill={Colors.primaryRed}
                className={styles.Icon}
                chapter={item.chapter}
              />
              <time className={styles.Datum} dateTime={item.datePublished}>
                {defaultDateFormat(item.datePublished)}
              </time>
              <h4 className={styles.Title}>{item.title}</h4>
              {!!item.description && (
                <p className={styles.Description}>{item.description}</p>
              )}
              <p className={styles.Action}>
                <ButtonLink to={item.link.to}>{item.link.label}</ButtonLink>
              </p>
            </li>
          );
        })}
      </ul>
      {total > items.length && (
        <p className={styles.FooterLink}>
          <ButtonLink to={AppRoutes.MIJN_UPDATES}>Alle updates</ButtonLink>
        </p>
      )}
    </div>
  );
}
