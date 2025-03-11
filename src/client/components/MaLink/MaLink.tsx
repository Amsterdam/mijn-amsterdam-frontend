import { AnchorHTMLAttributes } from 'react';

import { ButtonProps, Link, LinkProps } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import styles from './MaLink.module.scss';

type MaClassNameVariant = 'fatNoUnderline' | 'noDefaultUnderline';

type MaLinkProps = LinkProps & {
  maVariant?: MaClassNameVariant;
};

const maClassName: Record<MaClassNameVariant, string> = {
  fatNoUnderline: 'MaRouterLink__no-underline-fat',
  noDefaultUnderline: 'MaRouterLink__no-default-underline',
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
  return (
    <MaLink
      {...rest}
      href={href}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        }

        event.preventDefault();
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
