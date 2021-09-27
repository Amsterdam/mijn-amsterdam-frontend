import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { PolylineOptions } from 'leaflet';
import { isValidElement, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './Datasets.module.scss';
import { MaPointFeature } from '../../../server/services/buurt/datasets';
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
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.tint.level6 }}
      >
        <IconAfvalRest fill={themeColors.tint.level1} />
      </div>
    ),
    rest: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.tint.level6 }}
      >
        <IconAfvalRest fill={themeColors.tint.level1} />
      </div>
    ),
    papier: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAfvalPapier fill={themeColors.tint.level1} />
      </div>
    ),
    glas: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.yellow }}
      >
        <IconAfvalGlas />
      </div>
    ),
    textiel: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.tint.level6 }}
      >
        <IconAfvalTextiel fill={themeColors.tint.level1} />
      </div>
    ),
    gft: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconAfvalGft fill={themeColors.tint.level1} />
      </div>
    ),
    plastic: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.orange }}
      >
        <IconAfvalPlastic />
      </div>
    ),
  },
  evenementen: {
    evenementen: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.purple }}
      >
        <IconEvenement fill={themeColors.tint.level1} />
      </div>
    ),
  },
  wior: {
    wior: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.focus }}
      >
        <IconWior fill={themeColors.tint.level7} />
      </div>
    ),
  },
  bekendmakingen: {
    bekendmakingen: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconBekendmaking fill={themeColors.tint.level1} />
      </div>
    ),
  },
  sport: {
    sport: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSport fill={themeColors.tint.level1} />
      </div>
    ),
    gymzaal: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconGymzaal fill={themeColors.tint.level1} />
      </div>
    ),
    sporthal: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSporthal fill={themeColors.tint.level1} />
      </div>
    ),
    sportpark: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSportpark fill={themeColors.tint.level1} />
      </div>
    ),
    sportzaal: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSportzaal fill={themeColors.tint.level1} />
      </div>
    ),
    zwembad: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconZwembad fill={themeColors.tint.level1} />
      </div>
    ),
    hardlooproute: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconHardlopen fill={themeColors.tint.level1} />
      </div>
    ),
    sportveld: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSportveld fill={themeColors.tint.level1} />
      </div>
    ),
    sportaanbieder: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconGeneral fill={themeColors.tint.level1} />
      </div>
    ),
    openbaresportplek: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconFitness fill={themeColors.tint.level1} />
      </div>
    ),
  },
  openbaresportplek: {
    voetbal: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconVoetbal fill={themeColors.tint.level1} />
      </div>
    ),
    beachvolley: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconVolleybal fill={themeColors.tint.level1} />
      </div>
    ),
    basketbal: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconBasketbal fill={themeColors.tint.level1} />
      </div>
    ),
    'fitness / bootcamp': (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconFitness fill={themeColors.tint.level1} />
      </div>
    ),
    tennis: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconTennis fill={themeColors.tint.level1} />
      </div>
    ),
    'jeu de boules': (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconJeuDeBoules fill={themeColors.tint.level1} />
      </div>
    ),
    overig: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconOverig fill={themeColors.tint.level1} />
      </div>
    ),
    skate: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconSkate fill={themeColors.tint.level1} />
      </div>
    ),
    tafeltennis: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconTafeltennis fill={themeColors.tint.level1} />
      </div>
    ),
  },
  parkeren: {
    parkeren: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
  },
  parkeerzones: {
    oost: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    west: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.purple }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    noord: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    zuid: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.orange }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    zuidoost: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.lightgreen }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    'nieuw-west': (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.yellow }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    haven: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.supplement.pink }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
    centrum: (
      <div
        className={styles.DatasetIcon}
        style={{ backgroundColor: themeColors.support.valid }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </div>
    ),
  },
  default: (
    <div
      className={classnames(styles.DatasetIcon, styles.DatasetIconCircle)}
      style={{ backgroundColor: themeColors.tint.level7 }}
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
    default:
      childId = datasetId;
      break;
  }

  const icon = getIcon(datasetId, childId);

  return renderToStaticMarkup(icon || iconDefault);
}
export const POLYLINE_DATASET_OPTIONS: Record<string, PolylineOptions> = {};
