import classnames from 'classnames';
import React from 'react';
import { matchPath } from 'react-router';
import useRouter from 'use-react-router';
import {
  AppRoutes,
  Chapter as ChapterType,
  Chapters,
} from '../../../universal/config';
import { entries } from '../../../universal/helpers';
import { IconBurgerZaken } from '../../assets/icons';
import { Colors } from '../../config/app';
import { ChapterIcons } from '../../config/chapterIcons';
import styles from './ChapterIcon.module.scss';

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
