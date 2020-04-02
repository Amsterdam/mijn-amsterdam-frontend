import ChapterIcon from '../ChapterIcon/ChapterIcon';
import { Colors } from '../../../universal/config';
import { FocusItem } from '../../data-formatting/focus';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import { NavLink } from 'react-router-dom';
import React from 'react';
import classnames from 'classnames';
import styles from './MyCases.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { NavLink } from 'react-router-dom';
import { Colors } from 'config/App.constants';
import Heading from 'components/Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import { FocusItem } from 'data-formatting/focus';
import classnames from 'classnames';

type MyCase = FocusItem | FocusTozo; // NOTE: atm it's the only Case possible

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
          {items.map(item => (
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
