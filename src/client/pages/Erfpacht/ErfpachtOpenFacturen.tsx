import { Grid, Paragraph, Screen } from '@amsterdam/design-system-react';
import { ErfpachtDossierFactuur } from '../../../server/services/simple-connect/erfpacht';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  OverviewPage,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { useErfpachtV2Data } from './erfpachtData.hook';

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
      <Grid.Cell span="all" key={adres}>
        <TableV2
          caption={adres}
          items={facturen}
          displayProps={displayProps}
          className={tableClassName}
        />
      </Grid.Cell>
    );
  });
}

export default function ErfpachtOpenFacturen() {
  const {
    ERFPACHTv2,
    titleOpenFacturen,
    openFacturen,
    displayPropsOpenFacturen,
    isMediumScreen,
  } = useErfpachtV2Data();

  return (
    <OverviewPage>
      <PageHeading
        icon={<ThemaIcon thema={Themas.ERFPACHTv2} />}
        backLink={{ to: AppRoutes.ERFPACHTv2, title: 'Overzicht' }}
        isLoading={isLoading(ERFPACHTv2)}
      >
        {`Alle ${
          titleOpenFacturen?.toLocaleLowerCase() ?? 'openstaande facturen'
        }`}
      </PageHeading>
      <Screen>
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
      </Screen>
    </OverviewPage>
  );
}
