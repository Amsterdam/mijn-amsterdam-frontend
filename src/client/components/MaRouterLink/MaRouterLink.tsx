import { Link, LinkProps } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import styles from './MaRouterLink.module.scss';

type MaRouterLinkProps = LinkProps & {
  fatNoUnderline?: boolean;
};

export function MARouterLink({
  href,
  children,
  className,
  fatNoUnderline,
  ...rest
}: MaRouterLinkProps) {
  const history = useHistory();

  let className_ = className;

  if (fatNoUnderline === true) {
    className_ = classNames(className, styles.MaRouterLink__no_underline_fat);
  }

  return (
    <Link
      {...rest}
      className={className_}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        history.push(href as string);
      }}
    >
      {children}
    </Link>
  );
}
