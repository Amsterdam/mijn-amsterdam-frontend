import {
  ActionGroup,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import QRCode from 'react-qr-code';

import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { Breakpoints } from '../../config/app.ts';
import { useMediaLayout } from '../../hooks/media.hook.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaLink } from '../MaLink/MaLink.tsx';
import { ModalAndButton } from '../Modal/Modal.tsx';

function createHeading(afspraak: AfspraakFrontend): string {
  if (afspraak.products.length > 1) {
    const productNames = afspraak.products.map((product) => product.name);

    return new Intl.ListFormat('nl', {
      style: 'long',
      type: 'conjunction',
    }).format(productNames);
  }

  return afspraak.subject;
}

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
      <Row align="between">
        <Row>
          {!compact && <Icon svg={PersonAtDeskIcon} hidden size="heading-2" />}
          <div className="ams-prose">
            <Heading level={3} size="level-3">
              {createHeading(afspraak)}
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
                <ResponsiveActionGroup>
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
                    href={afspraak.icsLink.to}
                    rel="noopener noreferrer"
                    type="text/calendar"
                  >
                    Voeg toe aan uw agenda
                  </MaLink>
                </ResponsiveActionGroup>
              </>
            )}
          </div>
        </Row>
        {!compact && (
          <MaLink rel="noopener noreferrer" href={afspraak.cancellationLink}>
            Annuleren
          </MaLink>
        )}
      </Row>
    </article>
  );
}

export function ResponsiveActionGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSmallOrMediumScreen = useMediaLayout({
    minWidth: Breakpoints.medium,
  });

  if (isSmallOrMediumScreen) {
    return <ActionGroup>{children}</ActionGroup>;
  }

  return <Column alignHorizontal="start">{children}</Column>;
}
