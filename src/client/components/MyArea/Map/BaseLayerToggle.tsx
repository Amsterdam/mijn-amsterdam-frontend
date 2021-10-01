import { TileLayerOptions } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './BaseLayerToggle.module.scss';
import classnames from 'classnames';
import BaseLayer, { MAP_SERVER_ROOT } from './BaseLayer';

export enum BaseLayerType {
  Aerial = 'luchtfoto',
  Topo = 'topografie',
}

export type MapLayer = {
  id: string;
  label: string;
  urlTemplate: string;
};

type Props = {
  onChangeLayer?: (id: string, type: BaseLayerType) => void;
  aerialLayers?: MapLayer[];
  topoLayers?: MapLayer[];
  aerialDefaultIndex?: number;
  topoDefaultIndex?: number;
  activeLayer?: BaseLayerType;
  options?: TileLayerOptions;
};

export const DEFAULT_AMSTERDAM_LAYERS: MapLayer[] = [
  {
    id: 'normal',
    label: 'Normaal',
    urlTemplate: `${MAP_SERVER_ROOT}/topo_rd/{z}/{x}/{y}.png`,
  },
  {
    id: 'light',
    label: 'Licht',
    urlTemplate: `${MAP_SERVER_ROOT}/topo_rd_light/{z}/{x}/{y}.png`,
  },
  {
    id: 'blackwhite',
    label: 'Zwart / Wit',
    urlTemplate: `${MAP_SERVER_ROOT}/topo_rd_zw/{z}/{x}/{y}.png`,
  },
];

export const AERIAL_AMSTERDAM_LAYERS: MapLayer[] = [
  {
    id: 'lf2019',
    label: 'Luchtfoto 2019',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2019_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2018',
    label: 'Luchtfoto 2018',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2018_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'ir2018',
    label: 'Infrarood 2018',
    urlTemplate: `${MAP_SERVER_ROOT}/infrarood2018_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2017',
    label: 'Luchtfoto 2017',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2017_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2016',
    label: 'Luchtfoto 2016',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2016_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2015',
    label: 'Luchtfoto 2015',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2015_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2014',
    label: 'Luchtfoto 2014',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2014_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2013',
    label: 'Luchtfoto 2013',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2013_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2012',
    label: 'Luchtfoto 2012',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2012_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2011',
    label: 'Luchtfoto 2011',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2011_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2010',
    label: 'Luchtfoto 2010',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2010_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2009',
    label: 'Luchtfoto 2009',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2009_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2008',
    label: 'Luchtfoto 2008',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2008_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2007',
    label: 'Luchtfoto 2007',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2007_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2006',
    label: 'Luchtfoto 2006',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2006_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2005',
    label: 'Luchtfoto 2005',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2005_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2004',
    label: 'Luchtfoto 2004',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2004_RD/{z}/{x}/{y}.jpeg`,
  },
  {
    id: 'lf2003',
    label: 'Luchtfoto 2003',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2003_RD/{z}/{x}/{y}.jpeg`,
  },
];

const BaseLayerToggle: React.FC<Props> = ({
  onChangeLayer,
  aerialLayers = AERIAL_AMSTERDAM_LAYERS,
  topoLayers = DEFAULT_AMSTERDAM_LAYERS,
  aerialDefaultIndex = 0,
  topoDefaultIndex = 0,
  activeLayer = BaseLayerType.Topo,
  options,
  ...otherProps
}) => {
  const didMount = useRef(false);
  const [toggleBaseLayerType, setToggleBaseLayerType] = useState(activeLayer);

  const [selectedLayer] = useState({
    [BaseLayerType.Aerial]: aerialLayers[aerialDefaultIndex].urlTemplate,
    [BaseLayerType.Topo]: topoLayers[topoDefaultIndex].urlTemplate,
  });

  const currentAmsterdamLayers =
    toggleBaseLayerType === BaseLayerType.Topo ? topoLayers : aerialLayers;

  const handleToggle = useCallback(() => {
    setToggleBaseLayerType(
      toggleBaseLayerType === BaseLayerType.Aerial
        ? BaseLayerType.Topo
        : BaseLayerType.Aerial
    );
  }, [toggleBaseLayerType]);

  const layerTypeForButton = useMemo(
    () =>
      toggleBaseLayerType === BaseLayerType.Topo
        ? BaseLayerType.Aerial
        : BaseLayerType.Topo,
    [toggleBaseLayerType]
  );

  useEffect(() => {
    const id = currentAmsterdamLayers.find(
      ({ urlTemplate }) => urlTemplate === selectedLayer[toggleBaseLayerType]
    )?.id;
    if (didMount.current && onChangeLayer && id) {
      onChangeLayer(id, toggleBaseLayerType);
    }
    didMount.current = true;
  }, [
    toggleBaseLayerType,
    selectedLayer,
    currentAmsterdamLayers,
    onChangeLayer,
  ]);
  return (
    <div className={styles.Wrapper} {...otherProps}>
      <button
        className={classnames(
          styles.ToggleButton,
          layerTypeForButton === BaseLayerType.Aerial
            ? styles.AerialType
            : styles.TopoType
        )}
        title="Wissel tussen luchtfoto's of een topografische kaarten"
        onClick={handleToggle}
      />
      <BaseLayer
        options={options}
        baseLayer={selectedLayer[toggleBaseLayerType]}
      />
    </div>
  );
};

export default BaseLayerToggle;
