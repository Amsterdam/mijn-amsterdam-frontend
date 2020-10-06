import { ControlButton } from '@amsterdam/arm-core';
import { useMapInstance } from '@amsterdam/react-maps';
import React from 'react';
import { IconHomeSimple, IconHomeCommercial } from '../../assets/icons';
import { useProfileTypeValue } from '../../hooks/useProfileType';

interface HomeControlButtonProps {
  latlng: LatLngObject;
}

export default function HomeControlButton({ latlng }: HomeControlButtonProps) {
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
        console.log('zoom', mapInstance.getZoom());
        mapInstance.setView(latlng, mapInstance.getZoom());
      }}
    />
  );
}
