import { TileLayer } from '@amsterdam/react-maps';
import { TileLayer as TileLayerType, TileLayerOptions } from 'leaflet';
import { useEffect, useState } from 'react';

type Props = {
  baseLayer?: string;
  options?: TileLayerOptions;
};

export const MAP_SERVER_ROOT = 'https://{s}.data.amsterdam.nl';

const BaseLayer: React.FC<Props> = ({
  baseLayer = `${MAP_SERVER_ROOT}/topo_rd/{z}/{x}/{y}.png`,
  options = {
    subdomains: ['t1', 't2', 't3', 't4'],
    tms: true,
  },
}) => {
  const [baseLayerInstance, setBaseLayerInstance] = useState<TileLayerType>();

  useEffect(() => {
    if (baseLayer && baseLayerInstance) {
      baseLayerInstance.setUrl(baseLayer);
    }
  }, [baseLayer, baseLayerInstance]);

  return (
    <TileLayer
      setInstance={setBaseLayerInstance}
      args={[baseLayer]}
      options={options}
    />
  );
};

export default BaseLayer;
