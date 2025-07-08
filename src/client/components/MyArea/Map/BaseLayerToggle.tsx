import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import classnames from 'classnames';
import { TileLayerOptions } from 'leaflet';

import BaseLayer, { MAP_SERVER_ROOT } from './BaseLayer.tsx';
import styles from './BaseLayerToggle.module.scss';

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
];

export const AERIAL_AMSTERDAM_LAYERS: MapLayer[] = [
  {
    id: 'lf2019',
    label: 'Luchtfoto 2019',
    urlTemplate: `${MAP_SERVER_ROOT}/lufo2019_RD/{z}/{x}/{y}.jpeg`,
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
