import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  forwardRef,
  ReactNode,
} from 'react';

import classnames from 'classnames';
import { Link } from 'react-router-dom';

import styles from './Button.module.scss';
import { IconChevronRight, IconClose } from '../../assets/icons';
import { Colors } from '../../config/app';
import { trackLink } from '../../hooks/analytics.hook';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'plain' | 'inline';
  isDisabled?: boolean;
  iconPosition?: 'left' | 'right';
  className?: string;
  icon?: any;
  iconFill?: string;
  iconSize?: string;
  lean?: boolean;
  replace?: boolean | undefined;
}

export interface LinkdProps
  extends CustomButtonProps,
    AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
  href?: string;
}

export interface ButtonProps
  extends CustomButtonProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

type buttonStyleProps = Pick<
  CustomButtonProps,
  'lean' | 'isDisabled' | 'variant' | 'className'
>;

type ButtonBodyProps = Pick<
  CustomButtonProps,
  'icon' | 'iconPosition' | 'iconSize' | 'iconFill'
> & {
  children: ReactNode;
};

interface PositionedIconProps {
  position?: 'left' | 'right';
  icon?: any;
  iconSize?: string;
  iconFill?: string;
}

export function buttonStyle({
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

function PositionedIcon({
  icon,
  iconSize = '14px',
  iconFill = '#000',
  position,
}: PositionedIconProps) {
  const Icon = icon;
  return (
    <Icon
      aria-hidden="true"
      width={iconSize}
      height={iconSize}
      fill={iconFill}
      className={classnames(styles.Icon, styles[`Icon__${position}`])}
    />
  );
}

export function ButtonBody({
  icon,
  iconSize,
  iconPosition,
  iconFill,
  children,
}: ButtonBodyProps) {
  return (
    <>
      {!!icon && iconPosition === 'left' && (
        <PositionedIcon
          iconSize={iconSize}
          icon={icon}
          iconFill={iconFill}
          position={iconPosition}
        />
      )}
      {children}
      {!!icon && iconPosition === 'right' && (
        <PositionedIcon
          iconSize={iconSize}
          icon={icon}
          iconFill={iconFill}
          position={iconPosition}
        />
      )}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      className,
      lean = false,
      isDisabled = false,
      icon,
      iconSize,
      iconPosition = 'left',
      ...otherProps
    },
    ref
  ) => {
    return (
      <button
        {...otherProps}
        ref={ref}
        className={buttonStyle({ lean, isDisabled, variant, className })}
        disabled={isDisabled}
      >
        <ButtonBody iconSize={iconSize} icon={icon} iconPosition={iconPosition}>
          {children}
        </ButtonBody>
      </button>
    );
  }
);

type PolymorphicType = keyof JSX.IntrinsicElements | ComponentType<any>;

export default function Linkd({
  children,
  className,
  isDisabled,
  href,
  lean = true,
  variant = 'plain',
  icon = IconChevronRight,
  iconSize,
  iconPosition = 'left',
  external = false,
  onClick,
  download,
  iconFill,
  ...otherProps
}: LinkdProps) {
  const AnchorElement = 'a';
  const LinkElement: PolymorphicType = external || !href ? AnchorElement : Link;

  const relProp = {
    ...(LinkElement === Link ? {} : { rel: 'external noopener noreferrer' }),
  };

  const urlProp = {
    ...(LinkElement === Link ? { to: href } : { href }),
  };

  const downloadProp = {
    ...(download ? { download } : {}),
  };

  let clickHandler = onClick;

  if (!!href && external && !clickHandler) {
    clickHandler = () => trackLink(href, otherProps.title ?? '');
  }

  return (
    <LinkElement
      {...otherProps}
      {...relProp}
      {...urlProp}
      {...downloadProp}
      onClick={clickHandler}
      className={buttonStyle({
        lean,
        isDisabled,
        variant,
        className: classnames(styles.Linkd, className),
      })}
    >
      <ButtonBody
        icon={icon}
        iconSize={iconSize}
        iconPosition={iconPosition}
        iconFill={iconFill}
      >
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
  iconSize,
  className,
  ...otherProps
}: LinkdProps) {
  return (
    <Linkd
      {...otherProps}
      className={classnames(styles.LinkedInline, className)}
      icon={icon}
      iconSize={iconSize}
      external={external}
      variant={variant}
      lean={lean}
    >
      {children}
    </Linkd>
  );
}

export const ButtonStyles = styles;

export interface IconButtonProps
  extends Omit<ButtonProps, 'variant' | 'lean'>,
    ButtonHTMLAttributes<HTMLButtonElement> {}

export function IconButton({
  className,
  icon,
  iconSize = '32',
  iconFill = Colors.black,
  ...otherProps
}: IconButtonProps) {
  const Icon = icon;
  return (
    <Button
      {...otherProps}
      variant="plain"
      className={classnames(styles.IconButton, className)}
      lean={true}
    >
      <Icon
        width={iconSize}
        height={iconSize}
        className={styles.Icon}
        aria-hidden={true}
        fill={iconFill}
      />
    </Button>
  );
}

export function CloseButton({
  title = 'Sluiten',
  ...props
}: Omit<IconButtonProps, 'icon'>) {
  return <IconButton {...props} title={title} icon={IconClose} />;
}
