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
  const isPhoneScreen = useSmallScreen();

  return (
    <article className={className}>
      <Row align="between">
        <Row>
          {!compact && <Icon svg={<IconAfspraak />} hidden size="heading-2" />}
          <div className="ams-prose">
            <Heading
              level={3}
              size="level-3"
              className={!compact ? 'ams-mb-l' : ''}
            >
              {createHeading(afspraak)}
            </Heading>
            {compact && <CompactContent afspraak={afspraak} />}
            {!compact && (
              <FullContent afspraak={afspraak} isPhoneScreen={isPhoneScreen} />
            )}
          </div>
        </Row>
        {!compact && !isPhoneScreen && (
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

function FullContent({
  afspraak,
  isPhoneScreen,
}: {
  afspraak: AfspraakFrontend;
  isPhoneScreen: boolean;
}) {
  return (
    <>
      <DescriptionList className={isPhoneScreen ? 'ams-mb-xl' : 'ams-mb-m'}>
        <DescriptionList.Term>Datum</DescriptionList.Term>
        <DescriptionList.Description>
          <MaLink
            href={afspraak.icsLink.to}
            rel="noopener noreferrer"
            type="text/calendar"
          >
            <time dateTime={afspraak.dateStart}>
              {capitalizeFirstLetter(afspraak.displayDateTime)}
            </time>
          </MaLink>
        </DescriptionList.Description>
        <DescriptionList.Term>Locatie</DescriptionList.Term>
        <DescriptionList.Description>
          <LocationModal
            modalTitle={`Stadsloket ${afspraak.location.name} - ${afspraak.location.street}`}
            address={afspraak.location.street}
            buttonLabel={`Stadsloket ${afspraak.location.name}${
              afspraak.location.street ? `, ${afspraak.location.street}` : ''
            }`}
            buttonVariant="ma-link-like"
          />
        </DescriptionList.Description>
      </DescriptionList>

      <Column
        alignHorizontal="start"
        className={isPhoneScreen ? 'ams-mb-xl' : 'ams-mb-l'}
      >
        <ModalAndButton
          modal={{
            title: `QR code - Stadsloket ${afspraak.location.name}`,
          }}
          buttonVariant="secondary"
          buttonLabel="Toon QR code"
        >
          <>
            <QRCode size={256} value={afspraak.qrCode} className="ams-mb-s" />
            <Paragraph className="ams-mb-l">
              Scan deze QR code op het stadsloket zodat de medewerker weet dat u
              op het stadsloket aanwezig bent.
            </Paragraph>
          </>
        </ModalAndButton>
        {isPhoneScreen && (
          <MaLink
            rel="noopener noreferrer"
            href={afspraak.cancellationLink}
            maVariant="noDefaultUnderline"
          >
            Afspraak annuleren
          </MaLink>
        )}
      </Column>
    </>
  );
}

function CompactContent({ afspraak }: { afspraak: AfspraakFrontend }) {
  return (
    <>
      <Paragraph>
        Datum:{' '}
        <time dateTime={afspraak.dateStart}>{afspraak.displayDateTime}</time>
      </Paragraph>
      <Paragraph className="ams-mb-s">
        Locatie: Stadsloket {afspraak.location.name}
        {afspraak.location.street && `, ${afspraak.location.street}`}
      </Paragraph>
    </>
  );
}
