import { isValidElement, ReactElement, ReactNode } from 'react';

import classnames from 'classnames';
import { renderToStaticMarkup } from 'react-dom/server';

import styles from './Datasets.module.scss';
import type { MaPointFeature } from '../../../server/services/buurt/datasets';
import {
  IconAfvalGft,
  IconAfvalGlas,
  IconAfvalMelding,
  IconAfvalPapier,
  IconAfvalRest,
  IconAfvalTextiel,
  IconAuto,
  IconBasketbal,
  IconBekendmaking,
  IconBread,
  IconCivieleConstructies,
  IconEvenement,
  IconFitness,
  IconGeneral,
  IconGroenWater,
  IconGymzaal,
  IconHardlopen,
  IconJeuDeBoules,
  IconMeldingen,
  IconOverig,
  IconOverlastBedrijven,
  IconOverlastDieren,
  IconOverlastOpenbareRuimte,
  IconOverlastWater,
  IconSchoon,
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
  IconWegenVerkeerStraatmeubilair,
  IconWior,
  IconZwembad,
} from '../../assets/icons/map';
import { Colors } from '../../config/app';

const DatasetIcon: React.FC<{
  color?: string;
  className?: string;
  children?: ReactNode;
}> = ({ children, className, color = Colors.white }) => {
  return (
    <div className={classnames(styles.DatasetIcon, className)}>{children}</div>
  );
};

export const datasetIcons: Record<
  string,
  ReactNode | Record<string, ReactElement<any>>
> = {
  afvalcontainers: {
    afvalcontainers: (
      <DatasetIcon className={styles.DatasetIcon__grey}>
        <IconAfvalRest fill={Colors.white} />
      </DatasetIcon>
    ),
    rest: (
      <DatasetIcon className={styles.DatasetIcon__grey}>
        <IconAfvalRest fill={Colors.white} />
      </DatasetIcon>
    ),
    papier: (
      <DatasetIcon className={styles.DatasetIcon__lightBlue}>
        <IconAfvalPapier fill={Colors.white} />
      </DatasetIcon>
    ),
    glas: (
      <DatasetIcon className={styles.DatasetIcon__yellow}>
        <IconAfvalGlas fill={Colors.black} />
      </DatasetIcon>
    ),
    textiel: (
      <DatasetIcon className={styles.DatasetIcon__grey}>
        <IconAfvalTextiel fill={Colors.white} />
      </DatasetIcon>
    ),
    gft: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconAfvalGft fill={Colors.white} />
      </DatasetIcon>
    ),
    brood: (
      <DatasetIcon className={styles.DatasetIcon__purple}>
        <IconBread />
      </DatasetIcon>
    ),
  },
  evenementen: {
    evenementen: (
      <DatasetIcon className={styles.DatasetIcon__purple}>
        <IconEvenement fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  wior: {
    wior: (
      <DatasetIcon className={styles.DatasetIcon__focus}>
        <IconWior fill={Colors.black} />
      </DatasetIcon>
    ),
  },
  bekendmakingen: {
    bekendmakingen: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconBekendmaking fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  sport: {
    sport: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSport fill={Colors.white} />
      </DatasetIcon>
    ),
    gymzaal: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconGymzaal fill={Colors.white} />
      </DatasetIcon>
    ),
    sporthal: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSporthal fill={Colors.white} />
      </DatasetIcon>
    ),
    sportpark: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSportpark fill={Colors.white} />
      </DatasetIcon>
    ),
    sportzaal: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSportzaal fill={Colors.white} />
      </DatasetIcon>
    ),
    zwembad: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconZwembad fill={Colors.white} />
      </DatasetIcon>
    ),
    hardlooproute: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconHardlopen fill={Colors.white} />
      </DatasetIcon>
    ),
    sportveld: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSportveld fill={Colors.white} />
      </DatasetIcon>
    ),
    sportaanbieder: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconGeneral fill={Colors.white} />
      </DatasetIcon>
    ),
    openbaresportplek: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconFitness fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  openbaresportplek: {
    voetbal: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconVoetbal fill={Colors.white} />
      </DatasetIcon>
    ),
    beachvolley: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconVolleybal fill={Colors.white} />
      </DatasetIcon>
    ),
    basketbal: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconBasketbal fill={Colors.white} />
      </DatasetIcon>
    ),
    'fitness / bootcamp': (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconFitness fill={Colors.white} />
      </DatasetIcon>
    ),
    tennis: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconTennis fill={Colors.white} />
      </DatasetIcon>
    ),
    'jeu de boules': (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconJeuDeBoules fill={Colors.white} />
      </DatasetIcon>
    ),
    overig: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconOverig fill={Colors.white} />
      </DatasetIcon>
    ),
    skate: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconSkate fill={Colors.white} />
      </DatasetIcon>
    ),
    tafeltennis: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconTafeltennis fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  parkeren: {
    parkeren: (
      <DatasetIcon className={styles.DatasetIcon__lightBlue}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  parkeerzones: {
    oost: (
      <DatasetIcon className={styles.DatasetIcon__lightBlue}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    west: (
      <DatasetIcon className={styles.DatasetIcon__purple}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    noord: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    zuid: (
      <DatasetIcon className={styles.DatasetIcon__orange}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    zuidoost: (
      <DatasetIcon className={styles.DatasetIcon__lightGreen}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    'nieuw-west': (
      <DatasetIcon className={styles.DatasetIcon__yellow}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    haven: (
      <DatasetIcon className={styles.DatasetIcon__pink}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
    centrum: (
      <DatasetIcon className={styles.DatasetIcon__valid}>
        <IconAuto fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  meldingenBuurt: {
    meldingenBuurt: (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconMeldingen fill={Colors.white} />
      </DatasetIcon>
    ),
    afval: (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconAfvalMelding fill={Colors.white} />
      </DatasetIcon>
    ),
    'civiele-constructies': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconCivieleConstructies fill={Colors.white} />
      </DatasetIcon>
    ),
    'overlast-van-dieren': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconOverlastDieren fill={Colors.white} />
      </DatasetIcon>
    ),
    'overlast-op-het-water': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconOverlastWater fill={Colors.white} />
      </DatasetIcon>
    ),
    'openbaar-groen-en-water': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconGroenWater fill={Colors.white} />
      </DatasetIcon>
    ),
    'overlast-bedrijven-en-horeca': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconOverlastBedrijven fill={Colors.white} />
      </DatasetIcon>
    ),
    'overlast-in-de-openbare-ruimte': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconOverlastOpenbareRuimte fill={Colors.white} />
      </DatasetIcon>
    ),
    schoon: (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconSchoon fill={Colors.white} />
      </DatasetIcon>
    ),
    'wegen-verkeer-straatmeubilair': (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconWegenVerkeerStraatmeubilair fill={Colors.white} />
      </DatasetIcon>
    ),
    overig: (
      <DatasetIcon className={styles.DatasetIcon__bluePrimary}>
        <IconOverig fill={Colors.white} />
      </DatasetIcon>
    ),
  },
  default: (
    <DatasetIcon
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
  const iconDefault = datasetIcons.default;
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
    case 'meldingenBuurt':
      childId = getIconChildIdFromValue(datasetId, feature.properties.category);
      break;
    default:
      childId = datasetId;
      break;
  }

  const icon = getIcon(datasetId, childId);

  return renderToStaticMarkup(icon || iconDefault);
}
