import { PolylineOptions } from 'leaflet';
import { isValidElement, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './Datasets.module.scss';
import type { MaPointFeature } from '../../../server/services/buurt/datasets';
import { Colors } from '../../config/app';
import {
  IconAfvalGft,
  IconAfvalGlas,
  IconAfvalPapier,
  IconAfvalPlastic,
  IconAfvalRest,
  IconAfvalTextiel,
  IconAuto,
  IconBasketbal,
  IconBekendmaking,
  IconEvenement,
  IconFitness,
  IconGeneral,
  IconGymzaal,
  IconHardlopen,
  IconJeuDeBoules,
  IconOverig,
  IconSkate,
  IconSport,
  IconSporthal,
  IconSportpark,
  IconSportveld,
  IconSportzaal,
  IconTafeltennis,
  IconTennis,
  IconVoetbal,
  IconVolleybal,
  IconWior,
  IconZwembad,
} from '../../assets/icons/map';
import classnames from 'classnames';

export const datasetIcons: Record<
  string,
  ReactElement<any> | Record<string, ReactElement<any>>
> = {
  afvalcontainers: {
    afvalcontainers: (
      <div className={classnames(styles.DatasetIcon, styles.DatasetIcon__grey)}>
        <IconAfvalRest fill={Colors.white} />
      </div>
    ),
    rest: (
      <div className={classnames(styles.DatasetIcon, styles.DatasetIcon__grey)}>
        <IconAfvalRest fill={Colors.white} />
      </div>
    ),
    papier: (
      <div
        className={classnames(
          styles.DatasetIcon,
          styles.DatasetIcon__lightBlue
        )}
      >
        <IconAfvalPapier fill={Colors.white} />
      </div>
    ),
    glas: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__yellow)}
      >
        <IconAfvalGlas />
      </div>
    ),
    textiel: (
      <div className={classnames(styles.DatasetIcon, styles.DatasetIcon__grey)}>
        <IconAfvalTextiel fill={Colors.white} />
      </div>
    ),
    gft: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconAfvalGft fill={Colors.white} />
      </div>
    ),
    plastic: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__orange)}
      >
        <IconAfvalPlastic />
      </div>
    ),
  },
  evenementen: {
    evenementen: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__purple)}
      >
        <IconEvenement fill={Colors.white} />
      </div>
    ),
  },
  wior: {
    wior: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__focus)}
      >
        <IconWior fill={Colors.black} />
      </div>
    ),
  },
  bekendmakingen: {
    bekendmakingen: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconBekendmaking fill={Colors.white} />
      </div>
    ),
  },
  sport: {
    sport: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSport fill={Colors.white} />
      </div>
    ),
    gymzaal: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconGymzaal fill={Colors.white} />
      </div>
    ),
    sporthal: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSporthal fill={Colors.white} />
      </div>
    ),
    sportpark: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSportpark fill={Colors.white} />
      </div>
    ),
    sportzaal: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSportzaal fill={Colors.white} />
      </div>
    ),
    zwembad: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconZwembad fill={Colors.white} />
      </div>
    ),
    hardlooproute: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconHardlopen fill={Colors.white} />
      </div>
    ),
    sportveld: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSportveld fill={Colors.white} />
      </div>
    ),
    sportaanbieder: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconGeneral fill={Colors.white} />
      </div>
    ),
    openbaresportplek: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconFitness fill={Colors.white} />
      </div>
    ),
  },
  openbaresportplek: {
    voetbal: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconVoetbal fill={Colors.white} />
      </div>
    ),
    beachvolley: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconVolleybal fill={Colors.white} />
      </div>
    ),
    basketbal: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconBasketbal fill={Colors.white} />
      </div>
    ),
    'fitness / bootcamp': (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconFitness fill={Colors.white} />
      </div>
    ),
    tennis: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconTennis fill={Colors.white} />
      </div>
    ),
    'jeu de boules': (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconJeuDeBoules fill={Colors.white} />
      </div>
    ),
    overig: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconOverig fill={Colors.white} />
      </div>
    ),
    skate: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconSkate fill={Colors.white} />
      </div>
    ),
    tafeltennis: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconTafeltennis fill={Colors.white} />
      </div>
    ),
  },
  parkeren: {
    parkeren: (
      <div
        className={classnames(
          styles.DatasetIcon,
          styles.DatasetIcon__lightBlue
        )}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
  },
  parkeerzones: {
    oost: (
      <div
        className={classnames(
          styles.DatasetIcon,
          styles.DatasetIcon__lightBlue
        )}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    west: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__purple)}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    noord: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    zuid: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__orange)}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    zuidoost: (
      <div
        className={classnames(
          styles.DatasetIcon,
          styles.DatasetIcon__lightGreen
        )}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    'nieuw-west': (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__yellow)}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
    haven: (
      <div className={classnames(styles.DatasetIcon, styles.DatasetIcon__pink)}>
        <IconAuto fill={Colors.white} />
      </div>
    ),
    centrum: (
      <div
        className={classnames(styles.DatasetIcon, styles.DatasetIcon__valid)}
      >
        <IconAuto fill={Colors.white} />
      </div>
    ),
  },
  default: (
    <div
      className={classnames(
        styles.DatasetIconCircle,
        styles.DatasetIcon__black
      )}
    />
  ),
};

export function getIcon(id: string, childId?: string) {
  let icon;

  if (id && childId && datasetIcons[id] && (datasetIcons[id] as any)[childId]) {
    icon = (datasetIcons[id] as any)[childId];
  } else if (
    !childId &&
    id &&
    datasetIcons[id] &&
    isValidElement(datasetIcons[id])
  ) {
    icon = datasetIcons[id];
  }

  return icon && (icon as ReactElement<any>);
}

export function getIconChildIdFromValue(id: string, value: string) {
  let childId: undefined | string = undefined;

  switch (id) {
    default:
      childId = value?.toLowerCase();
      break;
  }

  return childId;
}

export function getIconHtml(feature: MaPointFeature) {
  let datasetId = feature.properties.datasetId;
  let iconDefault = datasetIcons.default;
  let childId: undefined | string = undefined;

  switch (datasetId) {
    case 'sport':
    case 'gymzaal':
    case 'sporthal':
    case 'sportpark':
    case 'sportzaal':
    case 'zwembad':
    case 'hardlooproute':
    case 'sportveld':
    case 'sportaanbieder':
      childId = datasetId;
      datasetId = 'sport';
      break;
    case 'afvalcontainers':
      childId = getIconChildIdFromValue(
        datasetId,
        feature.properties.fractie_omschrijving
      );
      break;
    case 'openbaresportplek':
      childId = getIconChildIdFromValue(
        datasetId,
        feature.properties.sportvoorziening
      );
      break;
    case 'parkeerzones':
      childId = getIconChildIdFromValue(
        datasetId,
        feature.properties.gebiedsnaam
      );
      break;
    case 'meldingen_buurt':
      childId = getIconChildIdFromValue(
        datasetId,
        feature.properties.categorie
      );
      break;
    default:
      childId = datasetId;
      break;
  }

  const icon = getIcon(datasetId, childId);

  return renderToStaticMarkup(icon || iconDefault);
}
export const POLYLINE_DATASET_OPTIONS: Record<string, PolylineOptions> = {};
