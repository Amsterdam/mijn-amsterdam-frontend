import React from 'react';

import GenericBase from './GenericBase';
import styles from './Laadpalen.module.scss';
import { laadpaalValueConfig } from '../../../../../universal/config/myarea-datasets';
import { getFullAddress } from '../../../../../universal/helpers/brp';
import {
  IconConnectorTypeCCS,
  IconConnectorTypeChademo,
  IconConnectorTypeMennekes,
} from '../../../../assets/icons';
import InfoDetail from '../../../InfoDetail/InfoDetail';

type Props = {
  panelItem: any;
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
      {!!panelItem.connector_type && (
        <InfoDetail
          label={`Connector type${connectorTypes.length > 1 ? 's' : ''}`}
          className={styles.Icons}
          value={
            icons && values ? (
              <>
                {icons.map((Icon: any, index: number) => (
                  <React.Fragment key={index}>
                    <Icon className={styles.Icon} />{' '}
                    {Array.isArray(values) && values[index]}
                  </React.Fragment>
                ))}
              </>
            ) : null
          }
          valueWrapperElement={'div'}
        />
      )}
      <InfoDetail
        label="Adres"
        value={getFullAddress(
          {
            straatnaam: panelItem.street,
            huisnummer: panelItem.housenumber,
            woonplaatsNaam: panelItem.city,
            postcode: panelItem.postalcode,
            huisnummertoevoeging: panelItem.housenumber_addition,
            huisletter: panelItem.housenumber_letter,
          },
          true
        )}
      />
      <InfoDetail label={'Snellader'} value={panelItem.snellader} />
      {!!panelItem.charging_cap_max && (
        <InfoDetail
          label="Maximum wattage"
          value={`${panelItem.charging_cap_max}Kwh`}
        />
      )}
      <InfoDetail label="Provider" value={panelItem.provider} />
    </GenericBase>
  );
}
