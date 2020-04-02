import {
  Chapter as ChapterType,
  Chapters,
} from '../../config/Chapter.constants';

import { AppRoutes } from '../../config/Routing.constants';
import { ChapterIcons } from '../../config/Chapter.constants';
import { Colors } from '../../config/App.constants';
import { ReactComponent as IconBurgerZaken } from '../../assets/icons/burgerzaken.svg';
import React from 'react';
import classnames from 'classnames';
import { entries } from '../../helpers/App';
import { matchPath } from 'react-router';
import styles from './ChapterIcon.module.scss';
import useRouter from 'use-react-router';

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
  const Icon = ChapterIcons[matchChapter] || IconBurgerZaken;

  return (
    <Icon
      aria-label={matchChapter}
      fill={fill}
      className={classnames(styles.ChapterIcon, className)}
    />
  );
}
