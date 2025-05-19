import { useState } from 'react';

import { Button, OrderedList } from '@amsterdam/design-system-react';

import styles from '../ErfpachtDetail.module.scss';
import { WijzigenLink } from './WijzigenLink';
import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { useMediumScreen } from '../../../../hooks/media.hook';

const MAX_ERFPACHTERS_VISIBLE_INITIALLY = 3;

interface ErfpachtersListProps {
  erfpachters?: ErfpachtDossiersDetail['relaties'];
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
  const colCountMediumScreen = 3;
  const colCountSmallScreen = 2;
  const colCount = isMediumScreen ? colCountMediumScreen : colCountSmallScreen;
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
    const hasBetaler = erfpachtersList.some((erfpachter) => erfpachter.betaler);
    return (
      <>
        <OrderedList
          markers={false}
          className={shouldCollapse ? styles.ColumnList : undefined}
          style={cssStyle()}
        >
          {erfpachtersList.map((relatie, index) => {
            const hasBetalerWijzigenLink =
              (relatie.betaler && relatie.relatieCode !== relatieCode) ||
              (!hasBetaler && relatie.relatieCode === relatieCode);
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
                {hasBetalerWijzigenLink ? (
                  <WijzigenLink
                    relatieCode={relatieCode}
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
            aria-expanded={!isCollapsed}
            style={{ transform: 'translateX(-1.4rem)' }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={`${isCollapsed ? 'Toon meer' : 'Verberg'} erfpachters`}
          >
            {isCollapsed ? 'Toon meer' : 'Verberg'}
          </Button>
        )}
      </>
    );
  }
  return null;
}
