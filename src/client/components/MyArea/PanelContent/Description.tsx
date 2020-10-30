import React from 'react';
import InfoDetail from '../../InfoDetail/InfoDetail';
import InnerHtml from '../../InnerHtml/InnerHtml';
import styles from './PanelContent.module.scss';

interface DescriptionProps {
  description: string;
  label?: string;
}

export default function Description({
  description,
  label = 'Beschrijving',
}: DescriptionProps) {
  return (
    <InfoDetail
      className={styles.InfoDetailDescription}
      label={label}
      el="div"
      value={<InnerHtml>{description}</InnerHtml>}
    />
  );
}
