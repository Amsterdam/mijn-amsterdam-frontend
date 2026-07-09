import { Heading } from '@amsterdam/design-system-react';

import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { AfspraakCard } from '../../../../components/AfspraakCard/AfspraakCard.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';

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
  const MAX_AMOUNT_AFSPRAKEN_DISPLAYED = maxAmountAfspraakDisplayed;

  return (
    <div className={className}>
      <Heading level={2} className="ams-mb-m">
        Afspraken bij een stadsloket
      </Heading>
      {afspraken
        .slice(0, MAX_AMOUNT_AFSPRAKEN_DISPLAYED)
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
        threshold={MAX_AMOUNT_AFSPRAKEN_DISPLAYED}
        label={`Al uw ${afspraken.length} afspraken bij een stadsloket`}
      />
    </div>
  );
}
