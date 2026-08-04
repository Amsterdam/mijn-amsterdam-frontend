import type { ReactNode } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import { Column } from '@amsterdam/design-system-react';

import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { AfspraakCard } from '../../../../components/AfspraakCard/AfspraakCard.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { LoadingContent } from '../../../../components/LoadingContent/LoadingContent.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';

type AfsprakenProps = {
  dashboard?: boolean;
  afspraken: AfspraakFrontend[];
  className?: string;
  maxItems?: number;
  isLoading?: boolean;
};

export function Afspraken({
  dashboard = false,
  afspraken = [],
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  className,
  isLoading = false,
}: AfsprakenProps) {
  const hasAfspraken = afspraken.length > 0;

  if (isLoading)
    return (
      <AfsprakenBase className={className} dashboard={dashboard}>
        <LoadingContent />
      </AfsprakenBase>
    );

  if (!hasAfspraken)
    return (
      <AfsprakenBase className={className} dashboard={dashboard}>
        <Paragraph>Er zijn geen afspraken bij het Stadsloket.</Paragraph>
      </AfsprakenBase>
    );

  return (
    <AfsprakenBase className={className} dashboard={dashboard}>
      <Column gap="large" className={!dashboard ? 'ams-mb-l' : ''}>
        {afspraken.slice(0, maxItems).map((afspraak) => (
          <AfspraakCard
            dashboard={dashboard}
            key={afspraak.caseReference}
            afspraak={afspraak}
          />
        ))}
      </Column>
      <LinkToListPage
        count={afspraken.length}
        route={themaConfig.listPageAfspraken.route.path}
        threshold={dashboard ? 0 : maxItems}
        label={`Bekijk uw ${afspraken.length} ${afspraken.length === 1 ? 'afspraak' : 'afspraken'}`}
        maVariant="default"
      />
    </AfsprakenBase>
  );
}

type AfsprakenBaseProps = {
  className?: string;
  children: ReactNode;
  dashboard: boolean;
};

export function AfsprakenBase({
  className,
  children,
  dashboard,
}: AfsprakenBaseProps) {
  return (
    <div className={className}>
      <Heading level={2} className="ams-mb-m">
        Afspraken bij een Stadsloket
      </Heading>
      {!dashboard && (
        <Paragraph className="ams-mb-m">
          Hier ziet u niet al uw afspraken. In het overzicht ziet u alleen de
          afspraken waarbij we uw persoonsgegevens nodig hebben om uw vraag te
          beantwoorden.
        </Paragraph>
      )}
      {children}
    </div>
  );
}
