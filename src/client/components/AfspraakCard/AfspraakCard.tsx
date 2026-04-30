import {
  Button,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';

import styles from './AfspraakCard.module.scss';

import { useSmallScreen } from '../../hooks/media.hook.ts';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useAfsprakenListData.hook.tsx';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';
import { CalendarLink } from '../CalendarLink/CalendarLink.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontendFinal;
  className?: string;
};

export function AfspraakCard({ afspraak, className }: AfspraakCardProps) {
  const isSmallScreen = useSmallScreen();
  const isLargeScreen = !isSmallScreen;

  const titleHeading = (
    // Make the heading text always take full space so the icon is always aligned with other items -
    // on small screens.
    <Heading level={3} className={styles.Heading}>
      {afspraak.subject}
    </Heading>
  );

  const actionRightside = (
    <MaLink className={styles.MaLink} href={afspraak.cancellationLink}>
      Annuleren
    </MaLink>
  );

  const icon = <Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>;

  return (
    <Row className={className} gap="large">
      {isLargeScreen && icon}
      <Column
        className={
          isLargeScreen
            ? styles.ColumnLargeScreen /* Make sure `actionRightside` is always aligned */
            : ''
        }
      >
        {isLargeScreen && titleHeading}
        {isSmallScreen && (
          <Row>
            {titleHeading}
            {icon}
          </Row>
        )}
        <Paragraph>{afspraak.displayDate}</Paragraph>
        <Paragraph>{`Locatie Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`}</Paragraph>
        <CalendarLink
          className={'ams-mb-s'}
          start={afspraak.startDate}
          end={afspraak.endDate}
          uid={afspraak.caseReference}
          summary={`Afspraak voor ${afspraak.subject}`}
          description={`Referentienummer: ${afspraak.caseReference}`}
          location={`Stadsloket ${afspraak.location.name}, ${afspraak.location.street}, ${afspraak.location.postalCode} ${afspraak.location.city}, Nederland`}
        >
          Voeg toe aan uw privé agenda
        </CalendarLink>
        <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
          <Button variant="secondary">Toon QR code</Button>
        </MaRouterLink>
        {isSmallScreen && actionRightside}
      </Column>
      {isLargeScreen && actionRightside}
    </Row>
  );
}
