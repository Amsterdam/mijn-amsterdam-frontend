import React from 'react';
import styles from './PageContentMainHeading.module.scss';
import composeClassNames from 'classnames';
import Heading, { HeadingTagName } from 'components/Heading/Heading';
import { ComponentChildren } from 'App.types';

type HeadingVariant = 'medium' | 'withIcon' | 'boxed' | 'boxedWithIcon';

export interface PageContentMainHeadingProps {
  el?: HeadingTagName;
  variant?: HeadingVariant;
  children: ComponentChildren;
  className?: any;
}

export default function PageContentMainHeading({
  el = 'h2',
  variant,
  children,
  className,
}: PageContentMainHeadingProps) {
  const classNames = composeClassNames(
    styles.PageContentMainHeading,
    variant && styles[`PageContentMainHeading__${variant}`],
    className
  );
  return (
    <Heading el={el} size="large" className={classNames}>
      {children}
    </Heading>
  );
}
