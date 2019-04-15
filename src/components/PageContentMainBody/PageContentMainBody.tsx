import React from 'react';
import styles from './PageContentMainBody.module.scss';
import classnames from 'classnames';
import { ChildrenContent } from 'App.types';

export interface PageContentMainBodyProps {
  children: ChildrenContent;
  variant?: 'regular';
  className?: any;
}

export default function PageContentMainBody({
  children,
  variant = 'regular',
  className,
}: PageContentMainBodyProps) {
  const classes = classnames(
    styles.PageContentMainBody,
    variant && styles[`PageContentMainBody__${variant}`],
    className
  );
  return <div className={classes}>{children}</div>;
}
