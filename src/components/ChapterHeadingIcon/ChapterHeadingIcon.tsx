import React from 'react';
import styles from './ChapterHeadingIcon.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { ChapterIconProps } from 'components/ChapterIcon/ChapterIcon';

export type ChapterHeadingIconProps = Omit<ChapterIconProps, 'className'>;

export default function ChapterHeadingIcon({
  ...rest
}: ChapterHeadingIconProps) {
  return (
    <ChapterIcon
      aria-hidden="true"
      className={styles.ChapterHeadingIcon}
      {...rest}
    />
  );
}
