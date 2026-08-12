import type { ReactNode } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { Column } from '@amsterdam/design-system-react';

import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import {
  AfspraakCard,
  AfspraakCardDashboard,
} from '../../../../components/AfspraakCard/AfspraakCard.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { LoadingContent } from '../../../../components/LoadingContent/LoadingContent.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';

type AfsprakenProps = {
  dashboard?: boolean;
  afspraken: AfspraakFrontend[];
  className?: string;
  isLoading?: boolean;
};

export function Afspraken({
  afspraken = [],
  className,
  isLoading = false,
}: AfsprakenProps) {
  const hasAfspraken = afspraken.length > 0;

  if (isLoading) {
    return (
      <AfsprakenBase className={className}>
        <LoadingContent />
      </AfsprakenBase>
    );
  }

  if (!hasAfspraken) {
    return (
      <AfsprakenBase className={className}>
        <Paragraph>Er zijn geen afspraken bij het Stadsloket.</Paragraph>
      </AfsprakenBase>
    );
  }

  return (
    <AfsprakenBase className={className}>
      <Column gap="large" className="ams-mb-l">
        {afspraken.slice(0, MAX_TABLE_ROWS_ON_THEMA_PAGINA).map((afspraak) => (
          <AfspraakCard key={afspraak.caseReference} afspraak={afspraak} />
        ))}
      </Column>
      <LinkToListPage
        count={afspraken.length}
        route={themaConfig.listPageAfspraken.route.path}
        threshold={MAX_TABLE_ROWS_ON_THEMA_PAGINA}
        label={`Bekijk uw ${afspraken.length} ${afspraken.length === 1 ? 'afspraak' : 'afspraken'}`}
        maVariant="default"
      />
    </AfsprakenBase>
  );
}

type AfsprakenBaseProps = {
  className?: string;
  children: ReactNode;
};

function AfsprakenBase({ className, children }: AfsprakenBaseProps) {
  return (
    <div className={className}>
      <AfsprakenHeading />
      <Paragraph className="ams-mb-m">
        Hier ziet u niet al uw afspraken. In het overzicht ziet u alleen de
        afspraken waarbij we uw persoonsgegevens nodig hebben om uw vraag te
        beantwoorden.
      </Paragraph>
      {children}
    </div>
  );
}

export function AfsprakenDashboard({ afspraken, className }: AfsprakenProps) {
  return (
    <div className={className}>
      <AfsprakenHeading />
      <AfspraakCardDashboard afspraak={afspraken[0]} className="ams-mb-s" />
      <LinkToListPage
        count={1}
        route={themaConfig.listPageAfspraken.route.path}
        threshold={0}
        label={`Bekijk uw ${afspraken.length} ${afspraken.length === 1 ? 'afspraak' : 'afspraken'}`}
        maVariant="default"
      />
    </div>
  );
}

export function AfsprakenHeading() {
  return (
    <Heading level={2} className="ams-mb-m">
      Afspraken bij een Stadsloket
    </Heading>
  );
}
