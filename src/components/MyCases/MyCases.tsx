import React from 'react';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import { itemClickPayload } from 'hooks/analytics.hook';
import { FocusItem } from 'data-formatting/focus';

const DEFAULT_TRACK_CATEGORY = 'Lopende_aanvragen';

type MyCase = FocusItem; // NOTE: atm it's the only Case possible

interface CaseItemProps {
  item: MyCase;
  trackCategory: string;
}

function CaseItem({ item, trackCategory }: CaseItemProps) {
  const {
    title,
    chapter,
    link: { to },
  } = item;
  return (
    <li className={styles.CaseItem}>
      <NavLink
        to={to}
        data-track={itemClickPayload(
          `${trackCategory}/${chapter}`,
          'Link_naar_Detail_pagina'
        )}
      >
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
  trackCategory: string;
}

export default function MyCases({
  title,
  items = [],
  isLoading = true,
  trackCategory = DEFAULT_TRACK_CATEGORY,
}: MyCasesProps) {
  return (
    <div className={styles.MyCases}>
      <Heading size="large">{title}</Heading>
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
          {items.map(item => (
            <CaseItem trackCategory={trackCategory} key={item.id} item={item} />
          ))}
        </ul>
      )}
      {!isLoading && !items.length && (
        <p>U hebt geen aanvragen lopen die u via Mijn Amsterdam kunt volgen.</p>
      )}
    </div>
  );
}
