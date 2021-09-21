import { TileLayerOptions } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './BaseLayerToggle.module.scss';
import { BaseLayer, constants } from '@amsterdam/arm-core';
import classnames from 'classnames';

export enum BaseLayerType {
  Aerial = 'luchtfoto',
  Topo = 'topografie',
}

type Props = {
  onChangeLayer?: (id: string, type: BaseLayerType) => void;
  aerialLayers?: constants.MapLayer[];
  topoLayers?: constants.MapLayer[];
  aerialDefaultIndex?: number;
  topoDefaultIndex?: number;
  activeLayer?: BaseLayerType;
  options?: TileLayerOptions;
};

const BaseLayerToggle: React.FC<Props> = ({
  onChangeLayer,
  aerialLayers = constants.AERIAL_AMSTERDAM_LAYERS,
  topoLayers = constants.DEFAULT_AMSTERDAM_LAYERS,
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
