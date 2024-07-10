import classnames from 'classnames';

import { matchPath, useLocation } from 'react-router-dom';
import {
  AppRoutes,
  Thema as ThemaType,
  Themas,
} from '../../../universal/config';
import { ThemaTitles } from '../../config/thema';
import { entries } from '../../../universal/helpers';
import { IconBurgerZaken } from '../../assets/icons';
import { Colors } from '../../config/app';
import { ThemaIcons } from '../../config/themaIcons';
import styles from './ThemaIcon.module.scss';

export interface ThemaIconProps {
  thema?: ThemaType;
  fill?: string;
  className?: string;
}

export default function ThemaIcon({
  thema,
  fill = Colors.black,
  className,
}: ThemaIconProps) {
  const location = useLocation();

  let matchThema: ThemaType = thema || Themas.ROOT;
  let label = thema;
  if (!thema) {
    const route = entries(AppRoutes).find(([themaId, path]) => {
      const match = matchPath(location.pathname, {
        path,
        exact: true,
        strict: false,
      });
      return !!(match && themaId);
    });
    if (route) {
      matchThema = route[0].split('/')[0] as ThemaType;
      label = ThemaTitles[matchThema];
    }
  }

  const Icon = ThemaIcons[matchThema] || IconBurgerZaken;

  return (
    <Icon
      aria-label={thema && ThemaTitles[thema] ? ThemaTitles[thema] : label}
      fill={fill}
      className={classnames(styles.ThemaIcon, className)}
    />
  );
}
