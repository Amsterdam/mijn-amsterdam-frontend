import { Heading, Icon, Link, Paragraph } from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';
import QRCode from 'react-qr-code';

import styles from './AfspraakCard.module.scss';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import { ModalAndButton } from '../Modal/Modal.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontend;
  className?: string;
  compact?: boolean;
};

export function AfspraakCard({
  afspraak,
  className,
  compact,
}: AfspraakCardProps) {
  const locatie = `Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`;
  const details = (
    <Paragraph>
      <time dateTime={afspraak.dateStart}>
        Datum, {afspraak.displayDateTime}
      </time>
      {compact && (
        <>
          <br />
          Locatie {locatie}
          <br />
          <MaRouterLink href={afspraak.link.to}>
            {afspraak.link.title}
          </MaRouterLink>
        </>
      )}
    </Paragraph>
  );

  return (
    <article className={classNames(styles.AfspraakCard, className)}>
      <Icon
        className={styles.Icon}
        svg={PersonAtDeskIcon}
        hidden
        size="heading-2"
      />
      <Heading level={3} size="level-3">
        {afspraak.subject}
      </Heading>
      {details}

      {!compact && (
        <>
          <LocationModal
            address={afspraak.location.street ?? afspraak.location.name}
            buttonVariant="ma-link-like"
            buttonLabel={`Locatie, ${locatie}`}
            buttonClassName={styles.LocationLink}
          />
          <br />
          <Link
            download={afspraak.icsLink.download}
            href={afspraak.icsLink.to}
            rel="noopener noreferrer"
            className={classNames(styles.ICSLink, 'ams-mb-m')}
          >
            {afspraak.icsLink.title}
          </Link>
          <br />
          <span className={styles.CancellationLinkContainer}>
            <Link
              rel="noopener noreferrer"
              className={classNames(styles.CancellationLink, 'ams-mb-m')}
              href={afspraak.cancellationLink}
            >
              Annuleren
            </Link>
            <br />
          </span>
          <ModalAndButton
            modal={{
              title: `QR code - Stadsloket ${afspraak.location.name}`,
            }}
            buttonVariant="secondary"
            buttonLabel="Toon QR code"
          >
            <>
              <QRCode size={256} value={afspraak.qrCode} className="ams-mb-s" />{' '}
              <Paragraph className="ams-mb-l">
                Scan deze QR code op het stadsloket zodat de medewerker weet dat
                u op het stadsloket aanwezig bent.
              </Paragraph>
            </>
          </ModalAndButton>
        </>
      )}
    </article>
  );
}
