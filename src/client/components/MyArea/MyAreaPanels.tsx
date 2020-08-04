import {
  MapPanel,
  MapPanelContent,
  MapPanelContext,
  MapPanelDrawer,
} from '@datapunt/arm-core';
import { SnapPoint } from '@datapunt/arm-core/es/components/MapPanel/constants';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useDesktopScreen } from '../../hooks';
import { atom, useRecoilState, selector, useRecoilValue } from 'recoil';

const panelConfig = {
  afvalcontainers: {
    title: 'Afvalcontainers',
    id: 'afvalcontainers',
    open: true,
    active: true,
  },
  evenementen: {
    title: 'Evenementen',
    id: 'evenementen',
    open: true,
    active: true,
  },
  bekendmakingen: {
    title: 'Bekendmakingen',
    id: 'bekendmakingen',
    open: true,
    active: true,
  },
  parkeerzones: {
    title: 'Parkeerzones',
    id: 'parkeerzones',
    open: true,
    active: true,
  },
};

const panelStateAtom = atom({
  key: 'MyAreaPanelState',
  default: panelConfig,
});

export const openPanelsSelector = selector({
  key: 'openPanels',
  get: ({ get }) => {
    const appState = get(panelStateAtom);
    return Object.values(appState)
      .filter(state => state.open === true)
      .map(state => state.id);
  },
});

export default function MyAreaPanels() {
  const isDesktop = useDesktopScreen();
  const PanelComponent = isDesktop ? MapPanel : MapPanelDrawer;
  // const mapPanel = useContext(MapPanelContext);
  // const openPanels = useRecoilValue(openPanelsSelector);
  const [panelState /*setPanelState*/] = useRecoilState(panelStateAtom);

  // useEffect(() => {
  //   if (
  //     openPanels.length &&
  //     !mapPanel.matchPositionWithSnapPoint(SnapPoint.Halfway)
  //   ) {
  //     mapPanel.setPositionFromSnapPoint(SnapPoint.Full);
  //   }
  // }, [openPanels, mapPanel]);

  // const closePanelContent = useCallback(
  //   (panelId: string) => {
  //     const updatedPanels = openPanels.filter(id => id !== panelId);

  //     if (!updatedPanels.length) {
  //       mapPanel.setPositionFromSnapPoint(SnapPoint.Closed);
  //     }

  //     setPanelState(panelState => {
  //       return { ...panelState, x: { ...panelState.x, open: false } };
  //     });
  //   },
  //   [openPanels, mapPanel, setPanelState]
  // );

  return (
    <PanelComponent>
      {panelState.afvalcontainers.open && (
        <MapPanelContent title={panelState.afvalcontainers.title} animate>
          hoi
        </MapPanelContent>
      )}
    </PanelComponent>
  );
}
