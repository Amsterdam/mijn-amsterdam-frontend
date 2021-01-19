import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { PolylineOptions } from 'leaflet';
import { isValidElement, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
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
  IconSport,
  IconTennis,
  IconVoetbal,
  IconVolleybal,
} from '../../assets/icons/map';
import { DEFAULT_POLYLINE_OPTIONS } from './MyAreaPolylineLayer';

const DatasetIcon = styled.div`
  margin-right: ${themeSpacing(2)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  width: 28px;
  height: 28px;
`;

const DatasetIconCircle = styled(DatasetIcon)`
  width: 16px;
  height: 16px;
`;

export const datasetIcons: Record<
  string,
  ReactElement<any> | Record<string, ReactElement<any>>
> = {
  afvalcontainers: {
    afvalcontainers: (
      <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
        <IconAfvalRest fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    rest: (
      <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
        <IconAfvalRest fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    papier: (
      <DatasetIcon
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAfvalPapier fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    glas: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.yellow }}>
        <IconAfvalGlas />
      </DatasetIcon>
    ),
    textiel: (
      <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
        <IconAfvalTextiel fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    gft: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconAfvalGft fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    plastic: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.orange }}>
        <IconAfvalPlastic />
      </DatasetIcon>
    ),
  },
  evenementen: {
    evenementen: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.purple }}>
        <IconEvenement fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
  },
  bekendmakingen: {
    bekendmakingen: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconBekendmaking fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
  },
  sport: {
    sport: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconSport fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
  },
  openbaresportplek: {
    voetbal: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconVoetbal fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    beachvolley: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconVolleybal fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    basketbal: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconBasketbal fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    'fitness / bootcamp': (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconFitness fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    tennis: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconTennis fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    'jeu de boules': (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        {/* <IconTennis fill={themeColors.tint.level1} /> */}
      </DatasetIcon>
    ),
    overig: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        {/* <IconTennis fill={themeColors.tint.level1} /> */}
      </DatasetIcon>
    ),
    skate: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        {/* <IconTennis fill={themeColors.tint.level1} /> */}
      </DatasetIcon>
    ),
    tafeltennis: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        {/* <IconTennis fill={themeColors.tint.level1} /> */}
      </DatasetIcon>
    ),
  },
  parkeren: {
    parkeren: (
      <DatasetIcon
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
  },
  parkeerzones: {
    oost: (
      <DatasetIcon
        style={{ backgroundColor: themeColors.supplement.lightblue }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    west: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.purple }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    noord: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    zuid: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.orange }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    zuidoost: (
      <DatasetIcon
        style={{ backgroundColor: themeColors.supplement.lightgreen }}
      >
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    'nieuw-west': (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.yellow }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    haven: (
      <DatasetIcon style={{ backgroundColor: themeColors.supplement.pink }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
    centrum: (
      <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
        <IconAuto fill={themeColors.tint.level1} />
      </DatasetIcon>
    ),
  },
  default: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.tint.level7 }} />
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
  const datasetId = feature.properties.datasetId;

  let iconDefault = datasetIcons.default;
  let childId: undefined | string = undefined;

  switch (datasetId) {
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
export const PARKEERZONES_POLYLINE_OPTIONS: Record<string, PolylineOptions> = {
  parkeerzones: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.yellow,
  },
  parkeerzones_uitzondering: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.pink,
  },
};
