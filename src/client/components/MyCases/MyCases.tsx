import classnames from 'classnames';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { MyCase } from '../../../universal/types';
import { Colors } from '../../config/app';
import ChapterIcon from '../ChapterIcon/ChapterIcon';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './MyCases.module.scss';

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
  className?: string;
}

export default function MyCases({
  title,
  items = [],
  className,
  isLoading = true,
  ...otherProps
}: MyCasesProps) {
  return (
    <div {...otherProps} className={classnames(styles.MyCases, className)}>
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
          {items.map((item) => (
            <CaseItem key={item.id} item={item} />
          ))}
        </ul>
      )}
      {!isLoading && !items.length && (
        <p>
          U hebt op dit moment geen aanvragen die u via Mijn Amsterdam kunt
          volgen.
        </p>
      )}
    </div>
  );
}
