import { useMemo } from 'react';

import { Heading, Icon, Link, Paragraph } from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';
import QRCode from 'react-qr-code';

import styles from './AfspraakCard.module.scss';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaRouterLink } from '../MaLink/MaLink.tsx';
import { ButtonAndModal } from '../Modal/Modal.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontend;
  className?: string;
  compact?: boolean;
};

function ActionItem({
  children,
  dash = true,
}: {
  children: React.ReactNode;
  dash?: boolean;
}) {
  return (
    <span className={styles.ActionItem}>
      {dash && <span className={styles['ActionItem-separator']}>&mdash;</span>}
      {children}
    </span>
  );
}

export function AfspraakCard({
  afspraak,
  className,
  compact,
}: AfspraakCardProps) {
  const locatie = `Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`;
  const details = (
    <Paragraph className="ams-mb-s">
      <time dateTime={afspraak.dateStart}>
        <strong>Datum:</strong> {afspraak.displayDateTime}
      </time>
      <br />
      <strong>Locatie:</strong> {locatie}
    </Paragraph>
  );
  const modalProps = useMemo(() => {
    return {
      title: `QR code stadsloket ${afspraak.location.name}`,
    };
  }, [afspraak.location.name]);
  return (
    <article className={classNames(styles.AfspraakCard, className)}>
      <Icon
        className={styles.Icon}
        svg={PersonAtDeskIcon}
        hidden
        size="heading-2"
      />
      <Heading level={3} size="level-3" className="ams-mb-s">
        {afspraak.subject}
      </Heading>
      {details}
      {compact ? (
        <MaRouterLink href={afspraak.link.to}>
          {afspraak.link.title}
        </MaRouterLink>
      ) : (
        <>
          <ActionItem dash={false}>
            <ButtonAndModal
              modal={modalProps}
              buttonVariant="ma-link-like"
              buttonLabel="Toon QR code"
            >
              <>
                <QRCode
                  size={256}
                  value={afspraak.qrCode}
                  className="ams-mb-s"
                />{' '}
                <Paragraph>
                  <time dateTime={afspraak.dateStart}>
                    {afspraak.displayDateTime}
                  </time>
                </Paragraph>
                <Paragraph className="ams-mb-l">
                  Scan deze QR code op het stadsloket zodat de medewerker weet
                  dat u op het stadsloket aanwezig bent.
                </Paragraph>
              </>
            </ButtonAndModal>
          </ActionItem>
          <ActionItem>
            <Link
              download={afspraak.icsLink.download}
              href={afspraak.icsLink.to}
              rel="noopener noreferrer"
            >
              {afspraak.icsLink.title}
            </Link>
          </ActionItem>

          <ActionItem>
            <LocationModal
              address={`${afspraak.location.street}`}
              buttonVariant="ma-link-like"
            />
          </ActionItem>

          <ActionItem>
            <Link rel="noopener noreferrer" href={afspraak.cancellationLink}>
              Annuleren
            </Link>
          </ActionItem>
        </>
      )}
    </article>
  );
}
