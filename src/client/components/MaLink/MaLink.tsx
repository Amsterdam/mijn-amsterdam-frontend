import { Link, LinkProps } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import styles from './MaLink.module.scss';

type MaClassNameVariant = 'fatNoUnderline' | 'noDefaultUnderline';

type MaLinkProps = LinkProps & {
  maVariant?: MaClassNameVariant;
  isExternal?: boolean;
};

const maClassName: Record<MaClassNameVariant, string> = {
  fatNoUnderline: 'MaRouterLink__no-underline-fat',
  noDefaultUnderline: 'MaRouterLink__no-default-underline',
};

/**
 *
 * MaLink is used when a link can be either internal or external
 */
export function MaLink({
  children,
  className,
  isExternal = false,
  ...rest
}: MaLinkProps) {
  return isExternal ? (
    <MaBaseLink {...rest} className={className}>
      {children}
    </MaBaseLink>
  ) : (
    <MaRouterLink {...rest} className={className}>
      {children}
    </MaRouterLink>
  );
}

/**
 * MaRouterLink is used when a link is internal
 */
export function MaRouterLink({
  href,
  onClick,
  maVariant,
  className,
  ...rest
}: MaLinkProps) {
  const history = useHistory();
  let className_ = className;

  if (maVariant) {
    className_ = classNames(className, styles[maClassName[maVariant]]);
  }
  return (
    <MaBaseLink
      {...rest}
      className={className_}
      href={href}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }

        event.preventDefault();
        history.push(href as string);
      }}
    >
      {rest.children}
    </MaBaseLink>
  );
}

function MaBaseLink({
  href,
  children,
  className,
  maVariant,
  onClick,
  ...rest
}: MaLinkProps) {
  let className_ = className;

  if (maVariant) {
    className_ = classNames(className, styles[maClassName[maVariant]]);
  }

  return (
    <Link {...rest} className={className_} href={href} onClick={onClick}>
      {children}
    </Link>
  );
}
