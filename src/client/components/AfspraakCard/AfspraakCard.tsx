import {
  ActionGroup,
  Heading,
  Icon,
  Paragraph,
  Row,
  Column,
} from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import QRCode from 'react-qr-code';

import styles from './AfspraakCard.module.scss';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaButtonLink } from '../MaLink/MaLink.tsx';
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
  return (
    <article className={className}>
      <Row>
        <Icon
          className={styles.Icon}
          svg={PersonAtDeskIcon}
          hidden
          size="heading-2"
        />
        <Column>
          <Heading level={3} size="level-3">
            {afspraak.subject}
          </Heading>
          <Paragraph>
            Datum:{' '}
            <time dateTime={afspraak.dateStart}>
              {afspraak.displayDateTime}
            </time>
          </Paragraph>
          <Paragraph>
            Locatie: Stadsloket {afspraak.location.name},{' '}
            {afspraak.location.street}
          </Paragraph>
          {!compact && (
            <>
              <ActionGroup style={{ paddingTop: 'var(--ams-space-s)' }}>
                <ModalAndButton
                  modal={{
                    title: `QR code - Stadsloket ${afspraak.location.name}`,
                  }}
                  buttonVariant="secondary"
                  buttonLabel="Toon QR code"
                >
                  <>
                    <QRCode
                      size={256}
                      value={afspraak.qrCode}
                      className="ams-mb-s"
                    />
                    <Paragraph className="ams-mb-l">
                      Scan deze QR code op het stadsloket zodat de medewerker
                      weet dat u op het stadsloket aanwezig bent.
                    </Paragraph>
                  </>
                </ModalAndButton>
                <LocationModal
                  address={afspraak.location.street ?? afspraak.location.name}
                  buttonLabel={'Toon op kaart'}
                />
                <MaButtonLink
                  variant="tertiary"
                  href={afspraak.icsLink.to}
                  download={afspraak.icsLink.download}
                  rel="noopener noreferrer"
                >
                  Voeg toe aan uw agenda
                </MaButtonLink>
                <MaButtonLink
                  variant="tertiary"
                  rel="noopener noreferrer"
                  href={afspraak.cancellationLink}
                >
                  Annuleren
                </MaButtonLink>
              </ActionGroup>
            </>
          )}
        </Column>
      </Row>
    </article>
  );
}
