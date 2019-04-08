import React from 'react';
import styles from './PageContentMainBody.module.scss';
import classnames from 'classnames';

export default function PageContentMainBody({ children, variant, className }) {
  const classes = classnames(
    styles.PageContentMainBody,
    variant && styles[`PageContentMainBody__${variant}`],
    className
  );
  return <div className={classes}>{children}</div>;
}
