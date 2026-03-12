import GenericBase from './GenericBase.tsx';
import type { Unshaped } from '../../../../../universal/types/App.types.ts';

interface MyArePanelContentParkerenProps {
  panelItem: Unshaped;
  datasetId: string;
}

export default function MyArePanelContentParkeren({
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
