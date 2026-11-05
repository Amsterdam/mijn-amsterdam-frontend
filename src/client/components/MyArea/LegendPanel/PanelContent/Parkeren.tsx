import type { Unshaped } from '../../../../../universal/types/App.types.ts';
import { GenericBase } from './GenericBase.tsx';

interface MyArePanelContentParkerenProps {
  panelItem: Unshaped;
  datasetId: string;
}

export function MyArePanelContentParkeren({
  datasetId,
  panelItem,
}: MyArePanelContentParkerenProps) {
  return (
    <GenericBase
      title={panelItem.gebiedsnaam}
      supTitle={
        datasetId === 'parkeerzones_uitzondering'
          ? 'Vergunningsgebied uitzondering'
          : 'Vergunningsgebied'
      }
    />
  );
}
