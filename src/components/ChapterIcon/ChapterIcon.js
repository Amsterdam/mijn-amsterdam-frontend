import React from 'react';

import { ReactComponent as IconBurgerZaken } from 'assets/images/burgerzaken.svg';
import { ReactComponent as IconGezondheid } from 'assets/images/gezondheid.svg';
import { ReactComponent as IconInkomen } from 'assets/images/inkomen.svg';
import { ReactComponent as IconWonen } from 'assets/images/wonen.svg';
import { ReactComponent as IconBelastingen } from 'assets/images/belastingen.svg';
import { Chapters, Colors } from 'App.constants';

export default function ChapterIcon({
  chapter,
  fill = Colors.black,
  className,
}) {
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

  return <Icon aria-hidden="true" fill={fill} className={className} />;
}
