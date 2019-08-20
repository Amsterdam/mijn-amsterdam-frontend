import React from 'react';
import styles from './PageContentMainBody.module.scss';
import classnames from 'classnames';
import { ComponentChildren } from 'App.types';

export interface PageContentMainBodyProps {
  children: ComponentChildren;
  variant?: 'regular' | 'boxed' | 'regularBoxed';
  className?: any;
  id?: string;
}

export default function PageContentMainBody({
  children,
  variant,
  className,
  id,
}: PageContentMainBodyProps) {
  const classes = classnames(
    styles.PageContentMainBody,
    variant && styles[`PageContentMainBody__${variant}`],
    className
  );
  return (
    <div id={id} className={classes}>
      {children}
    </div>
  );
}
