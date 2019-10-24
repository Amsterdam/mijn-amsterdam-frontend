import React, { Children } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styles from './Button.module.scss';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { ReactComponent as ChevronIcon } from 'assets/icons/Chevron-Right.svg';
import { ComponentChildren } from '../../App.types';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'plain';
  isDisabled?: boolean;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  className?: string;
  icon?: any;
  inline?: boolean;
}

export type ButtonLinkProps = LinkProps & CustomButtonProps & { LinkEl?: any };
export type ButtonProps = CustomButtonProps & {
  onClick?: (event: any) => void;
};

type ButtonStylesProps = Pick<
  CustomButtonProps,
  'inline' | 'isDisabled' | 'variant' | 'className'
>;

function ButtonStyles({
  inline,
  isDisabled,
  variant,
  className,
}: ButtonStylesProps) {
  return classnames(
    styles.Button,
    styles[`Button__${variant}`],
    inline && styles.Button__lean,
    isDisabled && styles.ButtonDisabled,
    className
  );
}

type ButtonBodyProps = Pick<
  CustomButtonProps,
  'icon' | 'iconPosition' | 'children'
>;

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
      className={ButtonStyles({ inline, isDisabled, variant, className })}
      disabled={isDisabled}
    >
      <ButtonBody icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonBody>
    </button>
  );
}

export default function ButtonLink({
  children,
  className,
  isDisabled,
  to,
  inline = true,
  variant = 'plain',
  icon,
  iconPosition = 'left',
  LinkEl = Link,
  ...otherProps
}: ButtonLinkProps) {
  const locProp = { ...(LinkEl === Link ? { to } : { href: to }) };
  return (
    <LinkEl
      {...locProp}
      {...otherProps}
      className={ButtonStyles({ inline, isDisabled, variant, className })}
    >
      <ButtonBody icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonBody>
    </LinkEl>
  );
}

//
export function ButtonLinkExternal(
  props: Omit<ButtonLinkProps, 'LinkEl' | 'rel'>
) {
  return (
    <ButtonLink LinkEl={'a'} {...props} rel="external noopener noreferrer">
      {props.children}
    </ButtonLink>
  );
}

// A button that looks like a link
export function LinkButton({
  children,
  icon = ChevronIcon,
  ...otherProps
}: ButtonProps) {
  return (
    <Button {...otherProps} icon={icon} variant="plain" inline={true}>
      {children}
    </Button>
  );
}

// A link with an icon
export function IconLink({
  children,
  to,
  icon = ChevronIcon,
  iconPosition = 'left',
  ...otherProps
}: ButtonLinkProps) {
  return (
    <ButtonLink {...otherProps} icon={icon} iconPosition={iconPosition} to={to}>
      {children}
    </ButtonLink>
  );
}

// An external link with an icon
export function IconLinkExternal({
  children,
  to,
  icon = ChevronIcon,
  iconPosition = 'left',
  ...otherProps
}: ButtonLinkProps) {
  return (
    <ButtonLinkExternal
      {...otherProps}
      icon={icon}
      iconPosition={iconPosition}
      to={to}
    >
      {children}
    </ButtonLinkExternal>
  );
}

/**
 * Varianten:
 *
 * Button (primary, secondary, secondary-inverted, link, plain)
 * ButtonWithIcon

 * InlineLinkWithIcon defaults to Chevron

 * InlineButtonWithIcon defaults to Chevron

 * ExternalInlineLinkWithIcon defaults to Chevron

 * ExternalInlineLinkWithoutIcon

 */
