import React from 'react';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';
import { MyCase } from 'hooks/api/my-cases-api.hook';
import classnames from 'classnames';
import LoadingContent from '../LoadingContent/LoadingContent';

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
        <ul
          className={classnames(
            styles.List,
            items.length % 2 === 1 && styles.List__odd
          )}
        >
          {items.map(item => (
            <CaseItem key={item.id} item={item} />
          ))}
        </ul>
      )}
      {!isLoading && !items.length && (
        <p>
          U hebt geen meldingen of aanvragen lopen die u via Mijn Amsterdam kunt
          volgen.
        </p>
      )}
    </div>
  );
}
