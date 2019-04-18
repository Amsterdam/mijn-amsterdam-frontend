import React from 'react';
import styles from './PageContentMainHeadingBackLink.module.scss';
import { ComponentChildren } from 'App.types';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';

export interface PageContentMainHeadingBackLinkProps {
  children: ComponentChildren;
  to: string;
}

export default function PageContentMainHeadingBackLink({
  children,
  to,
}: PageContentMainHeadingBackLinkProps) {
  return (
    <IconButtonLink className={styles.PageContentMainHeadingBackLink} to={to}>
      <CaretLeft /> {children}
    </IconButtonLink>
  );
}
