import { Paragraph } from '@amsterdam/design-system-react';

import { useErfpachtV2Data } from './erfpachtData.hook';
import { ErfpachtDossierFactuur } from '../../../server/services/simple-connect/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { isError } from '../../../universal/helpers/api';
import { ErrorAlert } from '../../components';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';

interface OpenFacturenListGroupedProps {
  facturen: ErfpachtDossierFactuur[];
  displayProps: DisplayProps<ErfpachtDossierFactuur> | null;
  tableClassName?: string;
}

export function OpenFacturenListGrouped({
  facturen,
  displayProps,
  tableClassName,
}: OpenFacturenListGroupedProps) {
  const facturenGrouped = facturen.reduce(
    (acc, factuur) => {
      if (!acc[factuur.dossierAdres]) {
        acc[factuur.dossierAdres] = [];
      }
      acc[factuur.dossierAdres].push(factuur);
      return acc;
    },
    {} as Record<string, ErfpachtDossierFactuur[]>
  );
  return Object.entries(facturenGrouped).map(([adres, facturen]) => {
    return (
      <PageContentCell key={adres}>
        <TableV2
          caption={adres}
          items={facturen}
          displayProps={displayProps}
          className={tableClassName}
        />
      </PageContentCell>
    );
  });
}

export function ErfpachtOpenFacturen() {
  const {
    ERFPACHTv2,
    titleOpenFacturen,
    openFacturen,
    displayPropsOpenFacturen,
    isMediumScreen,
  } = useErfpachtV2Data();

  return (
    <OverviewPageV2>
      <PageContentV2>
        <PageContentCell>
          <PageHeadingV2 backLink={AppRoutes.ERFPACHTv2}>
            {`Alle ${
              titleOpenFacturen?.toLocaleLowerCase() ?? 'openstaande facturen'
            }`}
          </PageHeadingV2>
          {isError(ERFPACHTv2) && (
            <ErrorAlert>
              We kunnen op dit moment geen openstaande facturen tonen.
            </ErrorAlert>
          )}

          {!isError(ERFPACHTv2) &&
            !!openFacturen.length &&
            (isMediumScreen ? (
              <TableV2
                items={openFacturen}
                displayProps={displayPropsOpenFacturen}
              />
            ) : (
              <OpenFacturenListGrouped
                facturen={openFacturen}
                displayProps={displayPropsOpenFacturen}
              />
            ))}
          {!openFacturen.length && (
            <Paragraph>
              U heeft geen{' '}
              {titleOpenFacturen?.toLowerCase() ?? 'openstaande facturen'}.
            </Paragraph>
          )}
        </PageContentCell>
      </PageContentV2>
    </OverviewPageV2>
  );
}
