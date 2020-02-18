import React from 'react';

import { Colors } from 'config/App.constants';
import { Chapters, Chapter as ChapterType } from 'config/Chapter.constants';
import { matchPath } from 'react-router';
import { entries } from 'helpers/App';
import styles from './ChapterIcon.module.scss';
import classnames from 'classnames';
import useRouter from 'use-react-router';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterIcons } from 'config/Chapter.constants';
import { ReactComponent as IconBurgerZaken } from 'assets/icons/burgerzaken.svg';

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
