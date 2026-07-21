import type { ReactNode } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';

import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { AfspraakCard } from '../../../../components/AfspraakCard/AfspraakCard.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';
import { LoadingContent } from '../../../../components/LoadingContent/LoadingContent.tsx';

type AfsprakenProps = {
  compact?: boolean;
  afspraken: AfspraakFrontend[];
  className?: string;
  maxItems?: number;
  isLoading?: boolean;
};

export function Afspraken({
  compact = false,
  afspraken = [],
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  className,
  isLoading = false,
}: AfsprakenProps) {
  const hasAfspraken = afspraken.length > 0;

  if (isLoading)
    return (
      <AfsprakenBase className={className}>
        <LoadingContent />
      </AfsprakenBase>
    );

  if (!hasAfspraken)
    return (
      <AfsprakenBase className={className}>
        <Paragraph>Er zijn geen afspraken bij het stadsloket.</Paragraph>
      </AfsprakenBase>
    );

  return (
    <AfsprakenBase className={className}>
      {afspraken.slice(0, maxItems).map((afspraak, i, afspraken) => (
        <AfspraakCard
          compact={compact}
          key={afspraak.caseReference}
          afspraak={afspraak}
        />
      ))}
      <LinkToListPage
        count={afspraken.length}
        route={themaConfig.listPageAfspraken.route.path}
        threshold={maxItems}
        label={`Bekijk uw ${afspraken.length} ${afspraken.length === 1 ? 'afspraak' : 'afspraken'}`}
      />
    </AfsprakenBase>
  );
}

type AfsprakenBaseProps = {
  className?: string;
  children: ReactNode;
};

export function AfsprakenBase({ className, children }: AfsprakenBaseProps) {
  return (
    <div className={className}>
      <Heading level={2} className="ams-mb-m">
        Afspraken bij een stadsloket
      </Heading>
      {children}
    </div>
  );
}
