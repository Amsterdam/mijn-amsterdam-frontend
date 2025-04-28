import React from 'react';

import GenericBase from './GenericBase';
import styles from './Laadpalen.module.scss';
import { laadpaalValueConfig } from '../../../../../universal/config/myarea-datasets';
import { getFullAddress } from '../../../../../universal/helpers/brp';
import { Unshaped } from '../../../../../universal/types/App.types';
import {
  IconConnectorTypeCCS,
  IconConnectorTypeChademo,
  IconConnectorTypeMennekes,
} from '../../../../assets/icons';
import { Datalist } from '../../../Datalist/Datalist';

type Props = {
  panelItem: Unshaped;
  datasetId: string;
};

function getIcon(type: keyof typeof laadpaalValueConfig) {
  let Icon;
  switch (type) {
    case 'IEC_62196_T2':
      Icon = IconConnectorTypeMennekes;
      break;
    case 'IEC_62196_T2_COMBO':
      Icon = IconConnectorTypeCCS;
      break;
    case 'CHADEMO':
      Icon = IconConnectorTypeChademo;
      break;
    default:
      Icon = IconConnectorTypeMennekes;
      break;
  }
  return Icon;
}

export default function MyAreaPanelContentLaadpalen({
  datasetId,
  panelItem,
}: Props) {
  const connectorTypes = panelItem.connector_type.split(';');
  const icons = connectorTypes.map((type: string) => getIcon(type));
  const values = connectorTypes.map(
    (type: string) =>
      laadpaalValueConfig[type as keyof typeof laadpaalValueConfig]
  );

  return (
    <GenericBase title={panelItem.name} supTitle="Laadpalen">
      <Datalist
        rows={[
          {
            label: `Connector type${connectorTypes.length > 1 ? 's' : ''}`,
            content:
              icons && values ? (
                <>
                  {icons.map((Icon: any, index: number) => (
                    <React.Fragment key={index}>
                      <Icon className={styles.Icon} />{' '}
                      {Array.isArray(values) && values[index]}
                    </React.Fragment>
                  ))}
                </>
              ) : null,
          },
          {
            label: 'Adres',
            content: getFullAddress(
              {
                straatnaam: panelItem.street,
                huisnummer: panelItem.housenumber,
                woonplaatsNaam: panelItem.city,
                postcode: panelItem.postalcode,
                huisnummertoevoeging: panelItem.housenumber_addition,
                huisletter: panelItem.housenumber_letter,
              },
              true
            ),
          },
          { label: 'Snellader', content: panelItem.snellader },
          {
            label: 'Maximum wattage',
            content: `${panelItem.charging_cap_max}Kwh`,
            isVisible: !!panelItem.charging_cap_max,
          },
          { label: 'Provider', content: panelItem.provider },
        ]}
      />
    </GenericBase>
  );
}
