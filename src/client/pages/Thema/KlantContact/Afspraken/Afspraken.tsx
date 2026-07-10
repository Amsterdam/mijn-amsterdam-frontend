import { Paragraph } from '@amsterdam/design-system-react';

import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { AfspraakCard } from '../../../../components/AfspraakCard/AfspraakCard.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';
import { Heading } from '@amsterdam/design-system-react';
import type { ReactNode } from 'react';

type AfsprakenProps = {
  compact?: boolean;
  afspraken: AfspraakFrontend[];
  className?: string;
  maxAmountAfspraakDisplayed?: number;
};

export function Afspraken({
  compact = false,
  afspraken = [],
  maxAmountAfspraakDisplayed = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  className,
}: AfsprakenProps) {
  const hasAfspraken = afspraken.length > 0;

  if (!hasAfspraken)
    return (
      <AfsprakenBase className={className}>
        <Paragraph>Er zijn geen afspraken bij het stadsloket.</Paragraph>
      </AfsprakenBase>
    );

  return (
    <AfsprakenBase className={className}>
      {afspraken
        .slice(0, maxAmountAfspraakDisplayed)
        .map((afspraak, i, afspraken) => (
          <AfspraakCard
            compact={compact}
            key={afspraak.caseReference}
            afspraak={afspraak}
            className={i < afspraken.length - 1 ? 'ams-mb-l' : ''}
          />
        ))}
      <LinkToListPage
        count={afspraken.length}
        route={themaConfig.listPageAfspraken.route.path}
        threshold={maxAmountAfspraakDisplayed}
        label={`Al uw ${afspraken.length} afspraken bij een stadsloket`}
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
