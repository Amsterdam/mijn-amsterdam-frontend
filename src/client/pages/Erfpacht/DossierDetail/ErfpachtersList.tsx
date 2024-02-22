import { Button, OrderedList } from '@amsterdam/design-system-react';
import { useState } from 'react';
import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { useMediumScreen } from '../../../hooks';
import styles from './ErfpachtDossierDetail.module.scss';
import { WijzigenLink } from './WijzigenLink';

const MAX_ERFPACHTERS_VISIBLE_INITIALLY = 3;

interface ErfpachtersListProps {
  erfpachters?: ErfpachtV2DossiersDetail['relaties'];
  debiteurNummer?: string;
  dossierNummer?: string;
  relatieCode?: string;
}

export function ErfpachtersList({
  erfpachters,
  debiteurNummer,
  dossierNummer,
  relatieCode,
}: ErfpachtersListProps) {
  const isMediumScreen = useMediumScreen();
  const colCount = isMediumScreen ? 3 : 2;
  const rowsPerCol = 8;
  const erfpachtersCount = erfpachters?.length ?? 0;
  const shouldCollapse = erfpachtersCount > MAX_ERFPACHTERS_VISIBLE_INITIALLY;
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse);

  function cssStyle() {
    if (!erfpachters?.length || (shouldCollapse && isCollapsed)) {
      return undefined;
    }

    return erfpachtersCount / colCount >= rowsPerCol
      ? {
          gridTemplateRows: `repeat(${Math.ceil(
            erfpachtersCount / colCount
          )}, var(--list-item-row-height))`,
        }
      : {
          gridTemplateRows: `repeat(${erfpachtersCount}, var(--list-item-row-height))`,
        };
  }

  const erfpachtersList =
    shouldCollapse && isCollapsed
      ? erfpachters?.slice(0, MAX_ERFPACHTERS_VISIBLE_INITIALLY)
      : erfpachters;

  if (erfpachtersList?.length) {
    return (
      <>
        <OrderedList
          markers={false}
          className={shouldCollapse ? styles.ColumnList : undefined}
          style={cssStyle()}
        >
          {erfpachtersList.map((relatie, index, all) => {
            const hasBetalerWijzigenLink =
              relatie.betaler && relatie.relatieCode !== relatieCode;
            return (
              <OrderedList.Item
                key={relatie.relatieNaam + index}
                className={
                  hasBetalerWijzigenLink
                    ? styles.withBetalerWijzigenLink
                    : undefined
                }
              >
                {relatie.relatieNaam}{' '}
                {relatie.betaler && hasBetalerWijzigenLink ? (
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
        {shouldCollapse && (
          <Button
            variant="tertiary"
            style={{ transform: 'translateX(-0.9rem)' }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Toon meer' : 'Verberg'}
          </Button>
        )}
      </>
    );
  }
  return null;
}
