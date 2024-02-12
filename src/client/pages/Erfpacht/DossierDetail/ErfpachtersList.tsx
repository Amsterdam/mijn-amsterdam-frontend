import { Link, OrderedList } from '@amsterdam/design-system-react';
import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import styles from './ErfpachtDossierDetail.module.scss';
import { useMediumScreen } from '../../../hooks';
import { WijzigenLink } from './WijzigenLink';

interface ErfpachtersListProps {
  erfpachters?: ErfpachtV2DossiersDetail['relaties'];
  debiteurNummer?: string;
  dossierNummer?: string;
}

export function ErfpachtersList({
  erfpachters,
  debiteurNummer,
  dossierNummer,
}: ErfpachtersListProps) {
  const isMediumScreen = useMediumScreen();
  const colCount = isMediumScreen ? 3 : 2;
  const rowsPerCol = isMediumScreen ? 12 : 4;

  function cssStyle() {
    if (!erfpachters?.length) {
      return undefined;
    }
    return erfpachters.length / colCount >= rowsPerCol
      ? {
          gridTemplateRows: `repeat(${Math.ceil(
            erfpachters.length / colCount
          )}, 1fr)`,
        }
      : {
          gridTemplateRows: `repeat(${erfpachters.length}, 1fr)`,
        };
  }

  if (erfpachters?.length) {
    return (
      <OrderedList
        markers={false}
        className={styles.ColumnList}
        style={cssStyle()}
      >
        {erfpachters.map((relatie, index, all) => {
          return (
            <OrderedList.Item key={relatie.relatieNaam}>
              {relatie.relatieNaam}{' '}
              {relatie.betaler ? (
                <WijzigenLink
                  linkVariant="inList"
                  relatieCode={relatie.relatieCode}
                  dossierNummer={dossierNummer}
                  debiteurNummer={debiteurNummer}
                />
              ) : (
                ''
              )}
            </OrderedList.Item>
          );
        })}
      </OrderedList>
    );
  }
  return null;
}
