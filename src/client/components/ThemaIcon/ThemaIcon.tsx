import classnames from 'classnames';

import { matchPath, useLocation } from 'react-router-dom';
import {
  AppRoutes,
  Thema as ChapterType,
  Themas,
} from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/thema';
import { entries } from '../../../universal/helpers';
import { IconBurgerZaken } from '../../assets/icons';
import { Colors } from '../../config/app';
import { ThemaIcons } from '../../config/themaIcons';
import styles from './ThemaIcon.module.scss';

export interface ChapterIconProps {
  thema?: ChapterType;
  fill?: string;
  className?: string;
}

export default function ThemaIcon({
  thema,
  fill = Colors.black,
  className,
}: ChapterIconProps) {
  const location = useLocation();

  let matchChapter: ChapterType = thema || Themas.ROOT;
  let label = thema;
  if (!thema) {
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
      label = ChapterTitles[matchChapter];
    }
  }

  const Icon = ThemaIcons[matchChapter] || IconBurgerZaken;

  return (
    <Icon
      aria-label={thema && ChapterTitles[thema] ? ChapterTitles[thema] : label}
      fill={fill}
      className={classnames(styles.ThemaIcon, className)}
    />
  );
}
