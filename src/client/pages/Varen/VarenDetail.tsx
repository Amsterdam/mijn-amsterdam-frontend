import {
  ActionGroup,
  Grid,
  GridColumnNumber,
  Icon,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { transformDetailsIntoRowSet } from './helpers';
import { useVarenDetailPage } from './useVarenDetailPage.hook';
import { labelMapsThemaDetail } from './Varen-thema-config';
import styles from './Varen.module.scss';
import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function VarenDetail() {
  const { vergunning, buttons, isLoading, isError } = useVarenDetailPage();

  const halfOfGrid: GridColumnNumber = 6;
  const vergunningRowSet = vergunning
    ? transformDetailsIntoRowSet(
        vergunning,
        labelMapsThemaDetail[vergunning.caseType],
        halfOfGrid
      )
    : null;
  const vergunningDetails = vergunningRowSet ? (
    <Grid.Cell span="all">
      <Datalist rows={[vergunningRowSet]} />
    </Grid.Cell>
  ) : null;

  const pageContentTopSecondary = !!buttons && (
    <Grid.Cell span="all">
      <ActionGroup>
        {buttons.map(({ to, title }) => (
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
    </Grid.Cell>
  );

  return (
    <ThemaDetailPagina<VarenFrontend>
      statusLabel="Status van uw aanvraag"
      title={vergunning?.title ?? 'Varen vergunning'}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      icon={<ThemaIcon />}
      pageContentTop={
        <>
          {vergunningDetails} {pageContentTopSecondary}
        </>
      }
      backLink={{
        title: ThemaTitles.VAREN,
        to: AppRoutes.VAREN,
      }}
    />
  );
}
