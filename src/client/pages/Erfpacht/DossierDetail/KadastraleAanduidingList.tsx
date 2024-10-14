import { OrderedList } from '@amsterdam/design-system-react';

import styles from './ErfpachtDossierDetail.module.scss';
import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';

interface KadastraleAanduidingListListProps {
  kadastraleaanduidingen?: ErfpachtV2DossiersDetail['kadastraleaanduidingen'];
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
