import { ControlButton } from '@amsterdam/arm-core';
import React from 'react';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { HOOD_ZOOM } from '../../../universal/config/map';
import { IconHome, IconHomeCommercial } from '../../assets/icons';
import { useMapInstance } from '@amsterdam/react-maps';

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
      icon={profileType === 'private' ? <IconHome /> : <IconHomeCommercial />}
      size={44}
      iconSize={20}
      onClick={() => mapInstance?.setView(latlng, zoom)}
    />
  );
}
