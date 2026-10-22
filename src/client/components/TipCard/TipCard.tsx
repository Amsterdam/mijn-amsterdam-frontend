import { useState } from 'react';

import { Heading, IconButton, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import styles from './TipCard.module.scss';
import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { MaLink } from '../MaLink/MaLink.tsx';

export const tipCardColors = ['green', 'azure', 'purple'] as const;

type TipCardProps = {
  backgroundColor: (typeof tipCardColors)[number];
  className?: string;
  description?: string;
  heading: string;
  link?: {
    title: string;
    to: string;
  };
  onRead: () => void;
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
  description,
  heading,
  link,
  onRead,
  tipReason,
}: TipCardProps) {
  const [isTipShown, showTip] = useState(false);

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
          label="Markeer tip als gelezen"
          size="large"
          onClick={() => onRead()}
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
        <MaLink className="ams-mb-xs" color="inverse" href={link.to}>
          {link.title}
        </MaLink>
      )}
      {isTipShown && tipReason && (
        <Paragraph color="inverse">{tipReason}</Paragraph>
      )}
    </article>
  );
}
