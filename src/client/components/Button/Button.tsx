import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

import classnames from 'classnames';

import styles from './Button.module.scss';
import { IconClose } from '../../assets/icons';
import { Colors } from '../../config/app';

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
  children?: ReactNode;
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
