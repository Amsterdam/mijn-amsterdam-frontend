import { AnchorHTMLAttributes } from 'react';

import {
  Breadcrumb,
  BreadcrumbLinkProps,
  ButtonProps,
  Link,
  LinkProps,
} from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import styles from './MaLink.module.scss';
import { usePageTypeSettingValue } from '../../hooks/useThemaMenuItems';

type MaClassNameVariant =
  | 'fatNoUnderline'
  | 'noDefaultUnderline'
  | 'noUnderline'
  | 'fatNoDefaultUnderline';

type MaLinkProps = LinkProps & {
  maVariant?: MaClassNameVariant;
};

const maClassName: Record<MaClassNameVariant, string> = {
  fatNoUnderline: 'MaRouterLink__no-underline-fat',
  noDefaultUnderline: 'MaRouterLink__no-default-underline',
  fatNoDefaultUnderline: 'MaRouterLink__no-default-underline-fat',
  noUnderline: 'MaRouterLink__no-underline',
};

export function MaLink({
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

export function MaRouterLink({ href, onClick, ...rest }: MaLinkProps) {
  const history = useHistory();
  const pageType = usePageTypeSettingValue();
  return (
    <MaLink
      {...rest}
      href={href}
      onClick={(event) => {
        event.preventDefault();

        if (onClick) {
          onClick(event);
        }

        history.push(href as string, {
          from: history.location.pathname,
          pageType,
        });
      }}
    />
  );
}

export function MaBreadcrumbLink({
  href,
  onClick,
  ...rest
}: BreadcrumbLinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const history = useHistory();
  return (
    <Breadcrumb.Link
      {...rest}
      href={href}
      onClick={(event) => {
        event.preventDefault();

        if (onClick) {
          onClick(event);
        }

        history.push(href as string);
      }}
    />
  );
}

type MaButtonLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'placeholder'
> & {
  variant?: ButtonProps['variant'];
  isDisabled?: boolean;
};

export function MaButtonLink({
  href,
  children,
  className,
  variant = 'primary',
  isDisabled = false,
  ...rest
}: MaButtonLinkProps) {
  const classes = classNames(
    styles.MaButtonLink,
    'ams-button',
    `ams-button--${variant}`,
    className
  );
  return (
    <a
      {...rest}
      className={classes}
      aria-disabled={isDisabled}
      href={!isDisabled ? href : undefined}
    >
      {children}
    </a>
  );
}

export function MaButtonRouterLink({
  href,
  children,
  className,
  variant = 'primary',
  onClick,
  ...rest
}: MaButtonLinkProps) {
  const history = useHistory();
  const pageType = usePageTypeSettingValue();
  return (
    <a
      {...rest}
      className={classNames(
        styles.MaButtonLink,
        'ams-button',
        `ams-button--${variant}`,
        className
      )}
      href={href}
      onClick={(event) => {
        event.preventDefault();

        if (onClick) {
          onClick(event);
        }

        history.push(href as string, {
          from: history.location.pathname,
          pageType,
        });
      }}
    >
      {children}
    </a>
  );
}
