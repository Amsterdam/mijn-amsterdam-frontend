import {
  ActionGroup,
  Grid,
  Icon,
  Paragraph,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { transformDetailsIntoRowSet } from './helpers';
import { useVarenThemaData } from './useVarenThemaData.hook';
import { labelMapThemaRegistratieReder } from './Varen-thema-config';
import styles from './Varen.module.scss';
import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { Datalist } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    De passagiersvaart in Amsterdam is erg populair bij bezoekers.
    Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook gehuurde
    boten, met of zonder schipper, vallen onder de passagiersvaart.
  </Paragraph>
);

export function Varen() {
  const {
    varenRederRegistratie,
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    buttonItems,
  } = useVarenThemaData();

  const pageContentTopSecondary = buttonItems.length ? (
    <ActionGroup>
      {buttonItems.map(({ to, title }) => (
        <MaButtonLink
          key={to}
          href={to}
          variant="secondary"
          className={styles.VarenButton}
        >
          {title}
          <Icon svg={ExternalLinkIcon} size="level-5" />
        </MaButtonLink>
      ))}
    </ActionGroup>
  ) : null;

  const gegevensAanvragerRowSet =
    varenRederRegistratie &&
    transformDetailsIntoRowSet(
      varenRederRegistratie,
      labelMapThemaRegistratieReder
    );

  const gegevensAanvrager = gegevensAanvragerRowSet?.rows.length ? (
    <Grid.Cell span="all">
      <Datalist rows={[gegevensAanvragerRowSet]} />
    </Grid.Cell>
  ) : null;

  const vergunningenTables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={title}
          zaken={varenVergunningen.filter(filter).sort(sort)}
          displayProps={displayProps}
          className={styles.VarenTableThemaPagina}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.VAREN}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={pageContentTop}
      pageContentTopSecondary={pageContentTopSecondary}
      pageContentMain={
        <>
          {gegevensAanvrager}
          {vergunningenTables}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
