import React from 'react';

import { ReactComponent as IconBurgerZaken } from 'assets/icons/burgerzaken.svg';
import { ReactComponent as IconZorg } from 'assets/icons/zorg.svg';
import { ReactComponent as IconInkomen } from 'assets/icons/inkomen.svg';
import { ReactComponent as IconWonen } from 'assets/icons/wonen.svg';
import { ReactComponent as IconBelastingen } from 'assets/icons/belastingen.svg';
import { ReactComponent as IconMyNotifications } from 'assets/icons/Bell.svg';
import { ReactComponent as IconTips } from 'assets/icons/Tip.svg';
import { ReactComponent as IconGarbage } from 'assets/icons/Huisvuilkalender.svg';
import { Colors } from 'config/App.constants';
import { Chapters, Chapter as ChapterType } from 'config/Chapter.constants';
import { matchPath } from 'react-router';
import { entries } from 'helpers/App';
import styles from './ChapterIcon.module.scss';
import classnames from 'classnames';
import useRouter from 'use-react-router';
import { AppRoutes } from 'config/Routing.constants';

export interface ChapterIconProps {
  chapter?: ChapterType;
  fill?: string;
  className?: string;
}

export default function ChapterIcon({
  chapter,
  fill = Colors.black,
  className,
}: ChapterIconProps) {
  const { location } = useRouter();

  let Icon;
  let matchChapter: ChapterType = chapter || Chapters.ROOT;

  if (!chapter) {
    const route = entries(AppRoutes).find(([chapterId, path]) => {
      const match = matchPath(location.pathname, {
        path,
        exact: true,
        strict: false,
      });
      return !!(match && chapterId);
    });
    if (route) {
      matchChapter = route[0].split('/')[0] as ChapterType;
    }
  }
  switch (matchChapter) {
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
    case Chapters.MIJN_GEGEVENS:
      Icon = IconBurgerZaken;
      break;
    default:
      Icon = IconBurgerZaken;
      break;
  }

  return (
    <Icon
      aria-label={matchChapter}
      fill={fill}
      className={classnames(styles.ChapterIcon, className)}
    />
  );
}
