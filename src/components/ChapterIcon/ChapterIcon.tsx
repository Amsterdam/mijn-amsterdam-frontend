import React from 'react';

import { ReactComponent as IconBurgerZaken } from 'assets/images/burgerzaken.svg';
import { ReactComponent as IconZorg } from 'assets/images/zorg.svg';
import { ReactComponent as IconInkomen } from 'assets/images/inkomen.svg';
import { ReactComponent as IconWonen } from 'assets/images/wonen.svg';
import { ReactComponent as IconBelastingen } from 'assets/images/belastingen.svg';
import { Chapters, Chapter as ChapterType, Colors } from 'App.constants';

import styles from './ChapterIcon.module.scss';
import classnames from 'classnames';

export interface ChapterIconProps {
  chapter: ChapterType;
  fill?: string;
  className?: any;
}

export default function ChapterIcon({
  chapter,
  fill = Colors.black,
  className,
}: ChapterIconProps) {
  let Icon;
  switch (chapter) {
    case Chapters.WONEN:
      Icon = IconWonen;
      break;
    case Chapters.INKOMEN:
      Icon = IconInkomen;
      break;
    case Chapters.BELASTINGEN:
      Icon = IconBelastingen;
      break;
    case Chapters.ZORG:
      Icon = IconZorg;
      break;
    default:
      Icon = IconBurgerZaken;
  }

  return (
    <Icon
      aria-hidden="true"
      fill={fill}
      className={classnames(styles.ChapterIcon, className)}
    />
  );
}
