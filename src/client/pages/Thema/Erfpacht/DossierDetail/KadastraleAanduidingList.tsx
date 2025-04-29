import { OrderedList } from '@amsterdam/design-system-react';

import type { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import styles from '../ErfpachtDetail.module.scss';

interface KadastraleAanduidingListListProps {
  kadastraleaanduidingen?: ErfpachtDossiersDetail['kadastraleaanduidingen'];
}

export function KadastraleAanduidingList({
  kadastraleaanduidingen,
}: KadastraleAanduidingListListProps) {
  if (kadastraleaanduidingen) {
    return (
      <OrderedList
        className={styles.DossierDetail__ordered_list}
        markers={false}
      >
        {kadastraleaanduidingen.map((kadestraleAanduiding) => {
          return (
            <OrderedList.Item key={kadestraleAanduiding.samengesteld}>
              {kadestraleAanduiding.samengesteld}
            </OrderedList.Item>
          );
        })}
      </OrderedList>
    );
  }
  return null;
}
