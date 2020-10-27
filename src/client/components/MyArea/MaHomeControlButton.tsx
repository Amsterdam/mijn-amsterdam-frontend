import { ControlButton } from '@amsterdam/arm-core';
import { useMapInstance } from '@amsterdam/react-maps';
import React from 'react';
import { IconHomeSimple, IconHomeCommercial } from '../../assets/icons';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { HOOD_ZOOM } from '../../../universal/config/buurt';

interface HomeControlButtonProps {
  latlng: LatLngObject;
  zoom?: number;
}

export default function HomeControlButton({
  latlng,
  zoom = HOOD_ZOOM,
}: HomeControlButtonProps) {
  const profileType = useProfileTypeValue();
  const mapInstance = useMapInstance();
  return (
    <ControlButton
      variant="blank"
      type="button"
      icon={
        profileType === 'private' ? <IconHomeSimple /> : <IconHomeCommercial />
      }
      size={44}
      iconSize={profileType === 'private' ? 40 : 20}
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
