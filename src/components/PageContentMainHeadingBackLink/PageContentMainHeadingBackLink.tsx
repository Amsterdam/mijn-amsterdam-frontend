import React from 'react';
import styles from './PageContentMainHeadingBackLink.module.scss';
import { ComponentChildren } from 'App.types';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';
import { itemClickPayload } from 'hooks/matomo.hook';

const DEFAULT_TRACK_CATEGORY = 'Detail_Pagina';

export interface PageContentMainHeadingBackLinkProps {
  children: ComponentChildren;
  to: string;
  trackCategory?: string;
}

export default function PageContentMainHeadingBackLink({
  children,
  to,
  trackCategory = DEFAULT_TRACK_CATEGORY,
}: PageContentMainHeadingBackLinkProps) {
  return (
    <IconButtonLink
      data-track={itemClickPayload(
        `${trackCategory}/Hoofd_titel/Link_terug_naar`,
        to
      )}
      className={styles.PageContentMainHeadingBackLink}
      to={to}
    >
      <CaretLeft /> {children}
    </IconButtonLink>
  );
}
