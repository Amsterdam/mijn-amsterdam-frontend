import React from 'react';
import {
  Alert,
  Grid,
  Heading,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { ErfpachtDossierFactuur } from '../../../server/services/simple-connect/erfpacht';
import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ChapterIcon, OverviewPage, PageHeading } from '../../components';
import {
  DisplayProps,
  TableV2,
  TableV2Props,
} from '../../components/Table/TableV2';
import styles from './Erfpacht.module.scss';
import { useErfpachtV2Data } from './erfpachtData.hook';
import classnames from 'classnames';

interface OpenFacturenListGroupedProps {
  facturen: ErfpachtDossierFactuur[];
  displayProps: DisplayProps<ErfpachtDossierFactuur> | null;
  gridColStyles?: TableV2Props<ErfpachtDossierFactuur>['gridColStyles'];
  tableClassName?: string;
}

export function OpenFacturenListGrouped({
  facturen,
  displayProps,
  gridColStyles,
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
        <Heading data-testid={adres} level={3}>
          {adres}
        </Heading>
        <TableV2
          items={facturen}
          displayProps={displayProps}
          className={classnames(
            styles.OpenFacturenTable__smallScreen,
            tableClassName
          )}
          gridColStyles={gridColStyles}
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
        {`Alle ${
          titleOpenFacturen?.toLocaleLowerCase() ?? 'openstaande facturen'
        }`}
      </PageHeading>
      <Screen>
        <Grid>
          {isError(ERFPACHTv2) && (
            <Grid.Cell span="all">
              <Alert title="Foutmelding" severity="error">
                <Paragraph>
                  We kunnen op dit moment geen openstaande facturen tonen.
                </Paragraph>
              </Alert>
            </Grid.Cell>
          )}

          {!isError(ERFPACHTv2) &&
            !!openFacturen.length &&
            (isMediumScreen ? (
              <Grid.Cell span="all">
                <TableV2
                  items={openFacturen}
                  displayProps={displayPropsOpenFacturen}
                  gridColStyles={colStyles.openFacturenTable}
                />
              </Grid.Cell>
            ) : (
              <OpenFacturenListGrouped
                facturen={openFacturen}
                displayProps={displayPropsOpenFacturen}
              />
            ))}
          {!openFacturen.length && (
            <Grid.Cell span="all">
              <Paragraph>
                U heeft geen{' '}
                {titleOpenFacturen?.toLowerCase() ?? 'openstaande facturen'}.
              </Paragraph>
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
