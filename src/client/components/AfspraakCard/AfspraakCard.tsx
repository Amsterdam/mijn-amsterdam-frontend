import {
  Button,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './AfspraakCard.module.scss';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useKlantcontactData.hook.tsx';
import { CalendarLink } from '../CalendarLink/CalendarLink.tsx';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import maLinkStyles from '../MaLink/MaLink.module.scss';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';
import { getRedactedClass } from '../../helpers/cobrowse.ts';

type AfspraakCardProps = {
  afspraak: AfspraakFrontendFinal;
  className?: string;
};

export function AfspraakCard({ afspraak, className }: AfspraakCardProps) {
  const isSmallScreen = useSmallScreen();

  const TitleHeading: React.FC<{ className?: string }> = ({ className }) => (
    <Heading level={3} className={className ?? ''}>
      {afspraak.subject}
    </Heading>
  );

  const CancellationLink: React.FC<{ className?: string }> = ({
    className,
  }) => (
    <MaLink className={className} href={afspraak.cancellationLink}>
      Annuleren
    </MaLink>
  );

  const icon = <Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>;

  const body = (
    <>
      <Paragraph>{afspraak.displayDate}</Paragraph>
      {/* Without this div the LocationModal is not clickable. */}
      <div>
        <LocationModal
          address={`${afspraak.location.street}`}
          className={classNames(
            'ams-link',
            maLinkStyles.MaLink,
            styles.LocationModalLink
          )}
        >
          {`Locatie Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`}
        </LocationModal>
      </div>
      <CalendarLink
        className={classNames(styles.Block, 'ams-mb-s')}
        icsData={{
          start: afspraak.startDate,
          end: afspraak.endDate,
          uid: `afspraak-stadsloket-${afspraak.caseReference}`,
          summary: `Afspraak voor ${afspraak.subject}`,
          description: `Referentienummer: ${afspraak.caseReference}`,
          location: `Stadsloket ${afspraak.location.name}, ${afspraak.location.street}, ${afspraak.location.postalCode} ${afspraak.location.city}, Nederland`,
        }}
      >
        Voeg toe aan uw privé agenda
      </CalendarLink>
    </>
  );

  if (isSmallScreen) {
    return (
      <Row className={className}>
        <Column>
          <Row>
            <TitleHeading className={styles.SmallScreenHeading}></TitleHeading>
            {icon}
          </Row>
          {body}
          <Row alignVertical="center">
            <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
              <Button variant="secondary">Toon QR code</Button>
            </MaRouterLink>
            <CancellationLink
              className={styles.SmallScreenCancellationLink}
            ></CancellationLink>
          </Row>
        </Column>
      </Row>
    );
  }
  return (
    <Row className={className} gap="large">
      {icon}
      <Column
        className={
          styles.ColumnLargeScreen /* Make sure `cancellationLink` is always in the same spot for alignment. */
        }
      >
        <TitleHeading></TitleHeading>
        {body}
        <Row alignVertical="center">
          <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
            <Button variant="secondary">Toon QR code</Button>
          </MaRouterLink>
        </Row>
      </Column>
      <CancellationLink></CancellationLink>
    </Row>
  );
}

export function AfspraakCards({
  afspraken,
}: {
  afspraken: AfspraakFrontendFinal[];
}) {
  const afspraakCards = afspraken.map((afspraak) => {
    return (
      <AfspraakCard
        className={classNames(
          getRedactedClass(),
          'ams-mb-m',
          styles.CardListContainer
        )}
        key={afspraak.caseReference}
        afspraak={afspraak}
      ></AfspraakCard>
    );
  });
  return afspraakCards;
}
