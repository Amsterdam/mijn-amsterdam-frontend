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

import { BFF_API_BASE_URL } from '../../../server/config/app.ts';
import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaButtonLink, MaLink } from '../MaLink/MaLink.tsx';
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
        {!compact && <Icon svg={PersonAtDeskIcon} hidden size="heading-2" />}
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
          <Paragraph className="ams-mb-s">
            Locatie: Stadsloket {afspraak.location.name}
            {afspraak.location.street && `, ${afspraak.location.street}`}
          </Paragraph>
          {!compact && (
            <>
              <ActionGroup className="ams-mb-l">
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
                {afspraak.location.street && (
                  <LocationModal
                    modalTitle={`Stadsloket ${afspraak.location.name} - ${afspraak.location.street}`}
                    address={afspraak.location.street}
                    buttonLabel="Toon op kaart"
                  />
                )}
                <MaLink
                  href={`${BFF_API_BASE_URL}/services/klantcontact/agenda.ics`}
                  type="text/calendar"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Voeg toe aan uw agenda
                </MaLink>
                <MaButtonLink
                  variant="tertiary"
                  rel="noopener noreferrer"
                  href={afspraak.cancellationLink}
                >
                  Afspraak annuleren
                </MaButtonLink>
              </ActionGroup>
            </>
          )}
        </Column>
      </Row>
    </article>
  );
}
