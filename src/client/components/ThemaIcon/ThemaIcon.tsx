import classnames from 'classnames';
import { matchPath, useLocation } from 'react-router-dom';

import styles from './ThemaIcon.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { Thema, Themas } from '../../../universal/config/thema';
import { entries } from '../../../universal/helpers/utils';
import { IconBurgerZaken } from '../../assets/icons';
import { Colors } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { ThemaIcons } from '../../config/themaIcons';

export interface ThemaIconProps {
  thema?: Thema;
  fill?: string;
  className?: string;
}

export default function ThemaIcon({
  thema,
  fill = Colors.black,
  className,
}: ThemaIconProps) {
  const location = useLocation();

  let matchThema: Thema = thema || Themas.ROOT;
  let label: string | undefined = thema;

  // Try to match the thema based on the current route
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
      matchThema = route[0].split('/')[0] as Thema;
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
