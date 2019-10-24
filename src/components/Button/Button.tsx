import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { ReactComponent as ChevronIcon } from 'assets/icons/Chevron-Right.svg';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'plain';
  isDisabled?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
  icon?: any;
  inline?: boolean;
}

export interface LinkdProps
  extends CustomButtonProps,
    AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  href: string;
}
export interface ButtonProps
  extends CustomButtonProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

type buttonStyleProps = Pick<
  CustomButtonProps,
  'inline' | 'isDisabled' | 'variant' | 'className'
>;

function buttonStyle({
  inline,
  isDisabled,
  variant,
  className,
}: buttonStyleProps) {
  return classnames(
    styles.Button,
    styles[`Button__${variant}`],
    inline && styles.Button__inline,
    isDisabled && styles.ButtonDisabled,
    className
  );
}

type ButtonBodyProps = Pick<CustomButtonProps, 'icon' | 'iconPosition'> & {
  children: ReactNode;
};

function ButtonBody({ icon, iconPosition, children }: ButtonBodyProps) {
  const Icon = icon;

  return (
    <>
      {!!icon && iconPosition === 'left' && (
        <Icon
          aria-hidden="true"
          className={classnames(styles.Icon, styles[`Icon__${iconPosition}`])}
        />
      )}
      {children}
      {!!icon && iconPosition === 'right' && (
        <Icon
          aria-hidden="true"
          className={classnames(styles.Icon, styles[`Icon__${iconPosition}`])}
        />
      )}
    </>
  );
}

export function Button({
  children,
  variant = 'secondary',
  className,
  inline = false,
  isDisabled = false,
  icon,
  iconPosition = 'left',
  ...otherProps
}: ButtonProps) {
  return (
    <button
      {...otherProps}
      className={buttonStyle({ inline, isDisabled, variant, className })}
      disabled={isDisabled}
    >
      <ButtonBody icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonBody>
    </button>
  );
}

export default function Linkd({
  children,
  className,
  isDisabled,
  href,
  inline = true,
  variant = 'plain',
  icon = ChevronIcon,
  iconPosition = 'left',
  external = false,
  ...otherProps
}: LinkdProps) {
  const LinkElement = external ? 'a' : Link;
  const relProp = {
    ...(LinkElement === Link ? {} : { rel: 'external noopener noreferrer' }),
  };
  return (
    <LinkElement
      {...otherProps}
      {...relProp}
      href={href}
      to={href}
      className={buttonStyle({ inline, isDisabled, variant, className })}
    >
      <ButtonBody icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonBody>
    </LinkElement>
  );
}
