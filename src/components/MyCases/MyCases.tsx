import React from 'react';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';
import { MyCase } from '../../data-formatting/focus';

interface CaseItemProps {
  item: MyCase;
}

function CaseItem({ item }: CaseItemProps) {
  const {
    title,
    chapter,
    link: { to },
  } = item;
  return (
    <li className={styles.CaseItem}>
      <NavLink to={to}>
        <ChapterIcon fill={Colors.primaryRed} chapter={chapter} />
        {title}
      </NavLink>
    </li>
  );
}

export interface MyCasesProps {
  title: string;
  items: MyCase[];
}

export default function MyCases({ title, items = [] }: MyCasesProps) {
  return (
    <div className={styles.MyCases}>
      <Heading size="large">{title}</Heading>
      <ul className={styles.List}>
        {items.map(item => (
          <CaseItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
