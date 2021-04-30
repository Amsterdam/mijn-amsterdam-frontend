import { BaseLayer, Map } from '@amsterdam/arm-core';
import { ThemeProvider } from '@amsterdam/asc-ui';
import { LatLngLiteral } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { HomeIconMarker } from './MyAreaMarker';

const DasboardMap = styled(Map)`
  position: absolute;
`;

interface MyAreaDashboardProps {
  tutorial: string;
}

export default function MyAreaDashboard({ tutorial }: MyAreaDashboardProps) {
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center =
    HOME.content?.latlng || (DEFAULT_MAP_OPTIONS.center as LatLngLiteral);
  return (
    <ThemeProvider>
      <DasboardMap
        fullScreen={true}
        aria-label={`Kaart van ${termReplace(
          ChapterTitles.BUURT
        ).toLowerCase()}`}
        options={{
          ...DEFAULT_MAP_OPTIONS,
          zoom: HOOD_ZOOM,
          center,
        }}
      >
        <BaseLayer />
        {!!HOME.content?.address && center && (
          <HomeIconMarker
            label={
              HOME.content?.address
                ? getFullAddress(HOME.content.address, true)
                : ''
            }
            center={center}
            zoom={HOOD_ZOOM}
          />
        )}
        {!HOME.content?.latlng && isLoading(HOME) && (
          <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
        )}
      </DasboardMap>
    </ThemeProvider>
  );
}
