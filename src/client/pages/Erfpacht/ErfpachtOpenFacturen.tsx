import { Grid, Heading, Screen } from '@amsterdam/design-system-react';
import { ErfpachtDossierFactuur } from '../../../server/services/simple-connect/erfpacht';
import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isLoading } from '../../../universal/helpers/api';
import { ChapterIcon, OverviewPage, PageHeading } from '../../components';
import {
  DisplayProps,
  TableV2,
  TableV2Props,
} from '../../components/Table/TableV2';
import styles from './Erfpacht.module.scss';
import { useErfpachtV2Data } from './erfpachtData.hook';

interface OpenFacturenListGroupedProps {
  facturen: ErfpachtDossierFactuur[];
  displayProps: DisplayProps<ErfpachtDossierFactuur> | null;
  gridColStyles?: TableV2Props<ErfpachtDossierFactuur>['gridColStyles'];
}

export function OpenFacturenListGrouped({
  facturen,
  displayProps,
  gridColStyles,
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
      <>
        <Grid.Cell fullWidth key={adres}>
          <Heading level={3}>{adres}</Heading>
          <TableV2
            items={facturen}
            displayProps={displayProps}
            className={styles.OpenFacturenTable__smallScreen}
            gridColStyles={gridColStyles}
          />
        </Grid.Cell>
      </>
    );
  });
}

export default function ErfpachtOpenFacturen() {
  const {
    ERFPACHTv2,
    titleOpenFacturen,
    openFacturen,
    displayPropsOpenFacturen,
    colStyles,
    isMediumScreen,
  } = useErfpachtV2Data();

  return (
    <OverviewPage>
      <PageHeading
        icon={<ChapterIcon chapter={Chapters.ERFPACHTv2} />}
        backLink={{ to: AppRoutes.ERFPACHTv2, title: 'Overzicht' }}
        isLoading={isLoading(ERFPACHTv2)}
      >
        {`Alle ${titleOpenFacturen?.toLocaleLowerCase()}`}
      </PageHeading>
      <Screen>
        <Grid>
          <Grid.Cell fullWidth>
            {isMediumScreen ? (
              <TableV2
                items={openFacturen}
                displayProps={displayPropsOpenFacturen}
                gridColStyles={colStyles.openFacturenTable}
              />
            ) : (
              <OpenFacturenListGrouped
                facturen={openFacturen}
                displayProps={displayPropsOpenFacturen}
                // gridColStyles={colStyles.openFacturenTable}
              />
            )}
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
