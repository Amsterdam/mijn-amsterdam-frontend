import React from 'react';
// import styles from './ChapterIcon.module.scss';

import { ReactComponent as IconBurgerZaken } from 'assets/images/burgerzaken.svg';
import { ReactComponent as IconGezondheid } from 'assets/images/gezondheid.svg';
import { ReactComponent as IconInkomen } from 'assets/images/inkomen.svg';
import { ReactComponent as IconWonen } from 'assets/images/wonen.svg';
import { ReactComponent as IconBelastingen } from 'assets/images/belastingen.svg';
import { Chapters } from 'App.constants';

export default function ChapterIcon({ chapter, fill = '#000000', className }) {
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
    case Chapters.GEZONDHEID:
      Icon = IconGezondheid;
      break;
    default:
      Icon = IconBurgerZaken;
  }

  return <Icon fill={fill} className={className} />;
}
