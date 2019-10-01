import React from 'react';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import { FocusItem } from 'data-formatting/focus';

type MyCase = FocusItem; // NOTE: atm it's the only Case possible

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
  isLoading: boolean;
}

export default function MyCases({
  title,
  items = [],
  isLoading = true,
}: MyCasesProps) {
  return (
    <div className={styles.MyCases}>
      <Heading
        id="MyCasesHeader" // Used for tutorial placement
        size="large"
      >
        {title}
      </Heading>
      {isLoading && (
        <LoadingContent
          className={styles.LoadingContent}
          barConfig={[
            ['auto', '2rem', '0'],
            ['auto', '2rem', '0'],
            ['auto', '2rem', '0'],
          ]}
        />
      )}
      {!!items.length && (
        <ul className={styles.List}>
          {[...items, ...items, ...items].map(item => (
            <CaseItem key={item.id} item={item} />
          ))}
        </ul>
      )}
      {!isLoading && !items.length && (
        <p>U hebt geen aanvragen lopen die u via Mijn Amsterdam kunt volgen.</p>
      )}
    </div>
  );
}
