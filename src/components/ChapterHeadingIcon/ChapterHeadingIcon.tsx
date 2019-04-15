import React from 'react';
import styles from './ChapterHeadingIcon.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export interface ChapterHeadingIconProps {
  className: any;
}

export default function ChapterHeadingIcon({
  className,
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
