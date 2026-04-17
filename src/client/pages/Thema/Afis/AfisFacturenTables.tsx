import { Paragraph } from '@amsterdam/design-system-react';

import type { AfisFactuurFrontend } from './Afis-thema-config.ts';
import {
  AfisDisclaimerOvergedragenFacturen,
  getVragenOverFactuurText,
} from './AfisThema.tsx';
import {
  type AfisFacturenThemaContextParams,
  useAfisFacturenData,
} from './useAfisThemaData.hook.tsx';
import { entries } from '../../../../universal/helpers/utils.ts';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';

type FacturenTablesProps = {
  themaContextParams?: AfisFacturenThemaContextParams;
};

export function AfisFacturenTables({
  themaContextParams,
}: FacturenTablesProps) {
  const { facturenByState, tableConfig } =
    useAfisFacturenData(themaContextParams);
  return entries(tableConfig)
    .filter(([state]) => themaContextParams?.states?.includes(state) ?? true)
    .map(
      ([
        state,
        { title, displayProps, maxItems, listPageLinkLabel, listPageRoute },
      ]) => {
        let totalItems = facturenByState?.[state]?.count ?? 0;
        let facturen = facturenByState?.[state]?.facturen ?? [];
        if (themaContextParams?.factuurFilterFn && facturen.length) {
          facturen = facturen.filter((factuur) =>
            themaContextParams.factuurFilterFn?.(factuur, state)
          );
          totalItems = facturen.length;
        }
        if (themaContextParams?.factuurMapFn && facturen.length) {
          facturen = facturen.map(
            (factuur) =>
              themaContextParams.factuurMapFn?.(factuur, state) ?? factuur
          );
        }
        let contentAfterTheTitle = null;
        if (state === 'overgedragen' && !!facturen.length) {
          contentAfterTheTitle = <AfisDisclaimerOvergedragenFacturen />;
        } else if (state === 'afgehandeld') {
          contentAfterTheTitle = (
            <Paragraph className="ams-mb-m">
              {getVragenOverFactuurText(`Vraag over factuur [factuurNummer]`)}
            </Paragraph>
          );
        }
        return (
          <ThemaPaginaTable<AfisFactuurFrontend>
            key={state}
            title={title}
            contentAfterTheTitle={contentAfterTheTitle}
            zaken={facturen}
            displayProps={displayProps}
            maxItems={maxItems}
            totalItems={totalItems}
            listPageLinkLabel={listPageLinkLabel}
            listPageRoute={listPageRoute}
          />
        );
      }
    )
    .filter(Boolean);
}
