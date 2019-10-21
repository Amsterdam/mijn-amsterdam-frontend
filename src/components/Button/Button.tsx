import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styles from './Button.module.scss';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { ReactComponent as ChevronIcon } from 'assets/icons/Chevron-Right.svg';

type CustomButtonProps = {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'plain';
  isDisabled?: boolean;
  iconPosition?: 'left' | 'right';
  hasIcon?: boolean;
  children: ReactNode;
  className?: string;
  icon?: any;
  isLean?: true;
};

export type ButtonLinkProps = LinkProps & CustomButtonProps;
export type ButtonProps = CustomButtonProps & {
  onClick?: (event: any) => void;
};

export function Button({
  children,
  variant = 'secondary',
  className,
  isDisabled = false,
  ...otherProps
}: ButtonProps) {
  return (
    <button
      className={classnames(
        styles.Button,
        styles[`Button__${variant}`],
        className
      )}
      {...otherProps}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}

export default function ButtonLink({
  children,
  className,
  isDisabled,
  to,
  isLean = true,
  variant = 'plain',
  icon = ChevronIcon,
  iconPosition = 'left',
  ...otherProps
}: ButtonLinkProps) {
  const TheIcon = icon;
  return (
    <Link
      to={to}
      className={classnames(
        styles.Button,
        styles[`Button__${variant}`],
        isLean && styles.Button__lean,
        isDisabled && styles.ButtonDisabled,
        className
      )}
      {...otherProps}
    >
      {!!icon && iconPosition === 'left' && (
        <TheIcon
          aria-hidden="true"
          className={classnames(styles.Icon, styles[`Icon__${iconPosition}`])}
        />
      )}
      {children}
      {!!icon && iconPosition === 'right' && (
        <TheIcon
          aria-hidden="true"
          className={classnames(styles.Icon, styles[`Icon__${iconPosition}`])}
        />
      )}
    </Link>
  );
}

export function ButtonLinkExternal(props: ButtonLinkProps) {
  return <ButtonLink {...props} rel="external" />;
}
