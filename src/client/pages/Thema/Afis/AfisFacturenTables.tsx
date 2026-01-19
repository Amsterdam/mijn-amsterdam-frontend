import type { AfisFactuurFrontend } from './Afis-thema-config';
import { AfisDisclaimerOvergedragenFacturen } from './AfisThema';
import {
  type AfisFacturenThemaContextParams,
  useAfisFacturenData,
} from './useAfisThemaData.hook';
import { entries } from '../../../../universal/helpers/utils';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';

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
        const contentAfterTheTitle =
          state === 'overgedragen' && !!facturen.length ? (
            <AfisDisclaimerOvergedragenFacturen />
          ) : null;
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
