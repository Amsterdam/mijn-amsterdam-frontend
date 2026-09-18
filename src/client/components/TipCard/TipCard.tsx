import { useState } from 'react';

import { Heading, IconButton, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './TipCard.module.scss';
import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { MaLink } from '../MaLink/MaLink.tsx';

export const tipCardColors = ['green', 'azure', 'purple'] as const;

type TipCardProps = {
  className?: string;
  backgroundColor: (typeof tipCardColors)[number];
  heading: string;
  description?: string;
  link?: {
    title: string;
    to: string;
  };
  tipReason?: string;
};

const tipCardClassName: Record<TipCardProps['backgroundColor'], string> = {
  green: 'TipCard__greenBackground',
  azure: 'TipCard__azureBackground',
  purple: 'TipCard__purpleBackground',
};

export function TipCard({
  backgroundColor,
  className,
  heading,
  description,
  link,
  tipReason,
}: TipCardProps) {
  const [isTipShown, showTip] = useState(false);
  const [isTipReasonShown, showTipReason] = useState(false);

  return (
    <article
      className={classNames(
        className,
        styles.TipCard,
        styles[tipCardClassName[backgroundColor]]
      )}
    >
      <div className={styles.TipCardHeader}>
        <Heading
          className={classNames('ams-mb-s', styles.Heading)}
          color="inverse"
          level={3}
          size="level-2"
        >
          {heading}
        </Heading>
        <IconButton
          className={styles.RemoveButton}
          color="inverse"
          label="Verwijder tip"
          size="large"
        />
      </div>
      {!isTipShown && (
        <MaLink
          color="inverse"
          href="/"
          maVariant="noDefaultUnderline"
          onClick={(event) => {
            event.preventDefault();
            showTip(true);
          }}
        >
          Toon tip
        </MaLink>
      )}
      {isTipShown && (
        <Paragraph color="inverse" className="ams-mb-s">
          {parseHTML(description)}
        </Paragraph>
      )}
      {isTipShown && link && (
        <MaLink color="inverse" href={link.to}>
          {link.title}
        </MaLink>
      )}
      {isTipShown && !isTipReasonShown && tipReason && (
        <MaLink
          color="inverse"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            showTipReason(true);
          }}
        >
          Waarom zie ik deze tip?
        </MaLink>
      )}
      {isTipReasonShown && tipReason && (
        <Paragraph color="inverse">{tipReason}</Paragraph>
      )}
    </article>
  );
}
