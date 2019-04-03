import React from 'react';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'App.constants';

function CaseItem({ item }) {
  const { title, chapter, to } = item;
  return (
    <li className={styles.CaseItem}>
      <NavLink to={to}>
        <ChapterIcon fill={Colors.primaryRed} chapter={chapter} />
        {title}
      </NavLink>
    </li>
  );
}

export default function MyCases({ title, items = [] }) {
  return (
    <div className={styles.MyCases}>
      <h2>{title}</h2>
      <ul className={styles.List}>
        {items.map(item => (
          <CaseItem item={item} />
        ))}
      </ul>
    </div>
  );
}
