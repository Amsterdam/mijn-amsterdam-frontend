import React from 'react';
import styles from './ChapterHeadingIcon.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default function ChapterHeadingIcon({ className, ...rest }) {
  return (
    <ChapterIcon
      aria-hidden="true"
      className={styles.ChapterHeadingIcon}
      {...rest}
    />
  );
}
