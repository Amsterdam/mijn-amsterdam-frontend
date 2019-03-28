import React from 'react';
import styles from './MijnUpdates.module.scss';
import ButtonLink from 'components/ButtonLink/ButtonLink';

export default function MijnUpdates({ items }) {
  return (
    <ul className={styles.MijnUpdates}>
      {items.map(item => {
        return (
          <li key={item.title} className={styles.MijnUpdateItem}>
            <h4 className={styles.Title}>{item.title}</h4>
            {!!item.description && (
              <p className={styles.Description}>{item.description}</p>
            )}
            <p>
              <ButtonLink to={item.link.to}>{item.link.label}</ButtonLink>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
