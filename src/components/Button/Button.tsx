import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { ReactComponent as ChevronIcon } from 'assets/icons/Chevron-Right.svg';
import { trackLink } from 'hooks/analytics.hook';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'plain' | 'inline';
  isDisabled?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
  icon?: any;
  lean?: boolean;
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
  'lean' | 'isDisabled' | 'variant' | 'className'
>;

function buttonStyle({
  lean,
  isDisabled,
  variant,
  className,
}: buttonStyleProps) {
  return classnames(
    styles.Button,
    styles[`Button__${variant}`],
    lean && styles.Button__lean,
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
  lean = false,
  isDisabled = false,
  icon,
  iconPosition = 'left',
  ...otherProps
}: ButtonProps) {
  return (
    <button
      {...otherProps}
      className={buttonStyle({ lean, isDisabled, variant, className })}
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
  lean = true,
  variant = 'plain',
  icon = ChevronIcon,
  iconPosition = 'left',
  external = false,
  onClick,
  ...otherProps
}: LinkdProps) {
  const LinkElement = external ? 'a' : Link;
  const relProp = {
    ...(LinkElement === Link ? {} : { rel: 'external noopener noreferrer' }),
  };

  let clickHandler = onClick;
  if (external && !clickHandler) {
    clickHandler = () => trackLink(href);
  }

  return (
    <LinkElement
      {...otherProps}
      {...relProp}
      href={href}
      to={href}
      onClick={clickHandler}
      className={buttonStyle({ lean, isDisabled, variant, className })}
    >
      <ButtonBody icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonBody>
    </LinkElement>
  );
}

export function LinkdInline({
  external,
  children,
  variant = 'inline',
  lean = true,
  icon = '',
  ...otherProps
}: LinkdProps) {
  return (
    <Linkd
      {...otherProps}
      icon={icon}
      external={external}
      variant={variant}
      lean={lean}
    >
      {children}
    </Linkd>
  );
}

export const ButtonStyles = styles;
