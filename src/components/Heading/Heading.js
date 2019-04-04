import React from 'react';
import styles from './Heading.module.scss';
import classnames from 'classnames';

const Sizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  MEDIUM_lARGE: 'mediumLarge',
  LARGE: 'large',
};

const Elements = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export default function Heading({
  el = Elements.h3,
  size = Sizes.MEDIUM,
  children,
  className,
  ...rest
}) {
  const El = Elements[el] || Elements.h3;
  const classes = classnames(
    styles.Heading,
    size && styles[`Heading__${size}`],
    className
  );
  return (
    <El className={classes} {...rest}>
      {children}
    </El>
  );
}
