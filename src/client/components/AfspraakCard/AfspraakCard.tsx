import {
  Column,
  DescriptionList,
  Heading,
  Paragraph,
  Row,
  Icon,
} from '@amsterdam/design-system-react';
import QRCode from 'react-qr-code';

import type { AfspraakFrontend } from '../../../server/services/klantcontact/klantcontact.types.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import { IconAfspraak } from '../../assets/icons/index.tsx';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import { MaLink } from '../MaLink/MaLink.tsx';
import { ModalAndButton } from '../Modal/Modal.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontend;
  className?: string;
};

export function AfspraakCard({ afspraak, className }: AfspraakCardProps) {
  const isPhoneScreen = useSmallScreen();

  return (
    <article className={className}>
      <Row align="between">
        <Row>
          <Icon svg={<IconAfspraak />} hidden size="heading-3" />
          <Column alignHorizontal="start">
            <AfspraakHeading>{afspraak.heading}</AfspraakHeading>
            <DescriptionList className={isPhoneScreen ? 'ams-mb-m' : ''}>
              <DescriptionList.Term>Datum</DescriptionList.Term>
              <DescriptionList.Description>
                <time dateTime={afspraak.dateStart}>
                  {capitalizeFirstLetter(afspraak.displayDateTime)}
                </time>
              </DescriptionList.Description>
              <DescriptionList.Term>Locatie</DescriptionList.Term>
              <DescriptionList.Description>
                {afspraak.location.street ? (
                  <LocationModal
                    modalTitle={`Stadsloket ${afspraak.location.name} - ${afspraak.location.street}`}
                    address={afspraak.location.street}
                    buttonLabel={`Stadsloket ${afspraak.location.name}${
                      afspraak.location.street
                        ? `, ${afspraak.location.street}`
                        : ''
                    }`}
                    buttonVariant="ma-link-like"
                  />
                ) : (
                  <>Stadsloket {afspraak.location.name}</>
                )}
              </DescriptionList.Description>
            </DescriptionList>

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
                  Scan deze QR code op het stadsloket zodat de medewerker weet
                  dat u op het stadsloket aanwezig bent.
                </Paragraph>
              </>
            </ModalAndButton>
            {isPhoneScreen && (
              <MaLink
                rel="noopener noreferrer"
                href={afspraak.cancellationLink}
                maVariant="noDefaultUnderline"
                className="ams-mb-m"
              >
                Afspraak annuleren
              </MaLink>
            )}
          </Column>
        </Row>
        {!isPhoneScreen && (
          <Column>
            <MaLink
              rel="noopener noreferrer"
              maVariant="noDefaultUnderline"
              href={afspraak.cancellationLink}
            >
              Annuleren
            </MaLink>
          </Column>
        )}
      </Row>
    </article>
  );
}

export function AfspraakCardDashboard({
  afspraak,
  className,
}: Omit<AfspraakCardProps, 'compact'>) {
  return (
    <article className={className}>
      <AfspraakHeading>{afspraak.heading}</AfspraakHeading>
      <Paragraph>
        Datum:{' '}
        <time dateTime={afspraak.dateStart}>{afspraak.displayDateTime}</time>
      </Paragraph>
      <Paragraph>
        Locatie: Stadsloket {afspraak.location.name}
        {afspraak.location.street && `, ${afspraak.location.street}`}
      </Paragraph>
    </article>
  );
}

function AfspraakHeading({ children }: { children: React.ReactNode }) {
  return (
    <Heading level={3} size="level-3">
      {children}
    </Heading>
  );
}
