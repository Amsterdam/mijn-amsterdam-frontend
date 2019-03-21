import React from 'react';
import styles from './PageContentMainBody.module.scss';

export default function PageContentMainBody({ children }) {
  return <div className={styles.PageContentMainBody}>{children}</div>;
}
