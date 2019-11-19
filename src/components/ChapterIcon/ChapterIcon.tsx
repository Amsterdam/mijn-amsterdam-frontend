import React from 'react';

import { ReactComponent as IconBurgerZaken } from 'assets/icons/burgerzaken.svg';
import { ReactComponent as IconZorg } from 'assets/icons/zorg.svg';
import { ReactComponent as IconInkomen } from 'assets/icons/inkomen.svg';
import { ReactComponent as IconWonen } from 'assets/icons/wonen.svg';
import { ReactComponent as IconBelastingen } from 'assets/icons/belastingen.svg';
import { ReactComponent as IconMyNotifications } from 'assets/icons/Bell.svg';
import { ReactComponent as IconTips } from 'assets/icons/Tip.svg';
import { ReactComponent as IconGarbage } from 'assets/icons/Huisvuilkalender.svg';
import { Chapters, Chapter as ChapterType, Colors } from 'App.constants';

import styles from './ChapterIcon.module.scss';
import classnames from 'classnames';

export interface ChapterIconProps {
  chapter: ChapterType;
  fill?: string;
  className?: string;
}

export default function ChapterIcon({
  chapter,
  fill = Colors.black,
  className,
}: ChapterIconProps) {
  let Icon;
  switch (chapter) {
    case Chapters.AFVAL:
      Icon = IconGarbage;
      break;
    case Chapters.MIJN_TIPS:
      Icon = IconTips;
      break;
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
    case Chapters.MELDINGEN:
      Icon = IconMyNotifications;
      break;
    default:
      Icon = IconBurgerZaken;
      break;
  }

  return (
    <Icon
      aria-label={chapter}
      fill={fill}
      className={classnames(styles.ChapterIcon, className)}
    />
  );
}
