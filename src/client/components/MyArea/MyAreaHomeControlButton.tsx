import { ControlButton } from '@amsterdam/arm-core';
import { useMapInstance } from '@amsterdam/react-maps';
import React from 'react';
import { IconHomeSimple, IconHomeCommercial } from '../../assets/icons';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { HOOD_ZOOM } from '../../../universal/config/buurt';
import { LatLngLiteral } from 'leaflet';

interface MyAreaHomeControlButtonProps {
  latlng: LatLngLiteral;
  zoom?: number;
}

export default function MyAreaHomeControlButton({
  latlng,
  zoom = HOOD_ZOOM,
}: MyAreaHomeControlButtonProps) {
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
