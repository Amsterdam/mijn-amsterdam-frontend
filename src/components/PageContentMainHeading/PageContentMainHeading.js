import React from 'react';
import styles from './PageContentMainHeading.module.scss';

export default function PageContentMainHeading({ size = 1, children }) {
  const H = `h${size}`;
  return <H className={styles.PageContentMainHeading}>{children}</H>;
}
