import React from 'react';
import styles from './Heading.module.scss';
import classnames from 'classnames';
import { ChildrenContent } from 'App.types';

type HeadingStyleSize = 'small' | 'medium' | 'mediumLarge' | 'large';

const Sizes: { [key: string]: HeadingStyleSize } = {
  SMALL: 'small',
  MEDIUM: 'medium',
  MEDIUM_LARGE: 'mediumLarge',
  LARGE: 'large',
};

type HeadingTagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const Elements: { [tagName in HeadingTagName]: HeadingTagName } = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

interface HeadingProps {
  el?: HeadingTagName;
  size?: HeadingStyleSize;
  children: ChildrenContent;
  className?: any;
}

export default function Heading({
  el = Elements.h3,
  size = Sizes.MEDIUM,
  children,
  className,
  ...rest
}: HeadingProps) {
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
