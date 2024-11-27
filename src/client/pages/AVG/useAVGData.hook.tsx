import { tableConfig } from './config';
import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AVGRequest } from '../../../server/services/avg/types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

function getFilteredAVGVerzoeken(
  verzoeken: AVGRequestFrontend[] | AVGRequest[] | null
) {
  return addLinkElementToProperty(
    (verzoeken ?? [])?.map((avgVerzoek) => ({
      ...avgVerzoek,
      ontvangstDatum: defaultDateFormat(avgVerzoek.ontvangstDatum),
      idAsLink: avgVerzoek.id,
      themaString: avgVerzoek?.themas?.join(', ') ?? '',
      title: ``,
      steps: [],
    })),
    'idAsLink'
  );
}

export function useAVGData() {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = getFilteredAVGVerzoeken(AVG.content?.verzoeken ?? null);

  return {
    tableConfig,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    avgVerzoeken,
  };
}
