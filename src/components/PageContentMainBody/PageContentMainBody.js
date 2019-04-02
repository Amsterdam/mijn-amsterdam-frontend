import React from 'react';
import styles from './PageContentMainBody.module.scss';
import classnames from 'classnames';

export default function PageContentMainBody({ children, className }) {
  return (
    <div className={classnames(styles.PageContentMainBody, className)}>
      {children}
    </div>
  );
}
