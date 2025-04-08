import { useMemo } from 'react';

import {
  listPageParamKind,
  routes,
  tableConfig,
  themaId,
  themaTitle,
} from './Inkomen-thema-config';
import { linkListItems } from './Inkomen-thema-config';
import { useAddDocumentLinkComponents } from './useAddDocumentLinks';
import { WpiRequestProcess } from '../../../server/services/wpi/wpi-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat, dateSort } from '../../../universal/helpers/date';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useInkomenThemaData() {
  const { WPI_AANVRAGEN, WPI_SPECIFICATIES, WPI_TOZO, WPI_TONK, WPI_BBZ } =
    useAppStateGetter();

  const aanvragen = WPI_AANVRAGEN?.content ?? [];
  const tozo = WPI_TOZO?.content ?? [];
  const tonk = WPI_TONK?.content ?? [];
  const bbz = WPI_BBZ?.content ?? [];

  const specificaties = useAddDocumentLinkComponents(
    WPI_SPECIFICATIES.content?.uitkeringsspecificaties ?? []
  );
  const jaaropgaven = useAddDocumentLinkComponents(
    WPI_SPECIFICATIES.content?.jaaropgaven ?? []
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId.INKOMEN);

  const zaken = useMemo(() => {
    if ((!aanvragen.length && !tozo.length) || !tonk.length) {
      return [];
    }

    const zaken = [
      ...(aanvragen || []),
      ...(tozo || []),
      ...(tonk || []),
      ...(bbz || []),
    ]
      .map((item) => {
        const isBbz = item.about === 'Bbz';
        const isBbzHistoric =
          isBbz && item.steps.some((step) => step.id === 'besluit');
        const activeStatusStep = item.steps[item.steps.length - 1];
        return Object.assign({}, item, {
          displayDateEnd: defaultDateFormat(item.dateEnd || item.datePublished),
          displayDateStart: isBbzHistoric
            ? defaultDateFormat(
                item.steps.find((s) => s.id === 'aanvraag')?.datePublished ||
                  item.dateStart
              )
            : defaultDateFormat(item.dateStart),
          status: isBbzHistoric
            ? '-'
            : isBbz
              ? 'In behandeling'
              : activeStatusStep?.status.replace(/-\s/g, '') || '', // Compensate for pre-broken words like Terugvorderings- besluit.
        });
      })
      .sort(dateSort('datePublished', 'desc'));

    return addLinkElementToProperty<WpiRequestProcess>(zaken, 'title', true);
  }, [aanvragen, tozo, tonk, bbz]);

  const isLoadingWpi =
    isLoading(WPI_AANVRAGEN) ||
    isLoading(WPI_TOZO) ||
    isLoading(WPI_TONK) ||
    isLoading(WPI_BBZ);

  const isErrorWpi =
    isError(WPI_AANVRAGEN) ||
    isError(WPI_TOZO) ||
    isError(WPI_TONK) ||
    isError(WPI_BBZ);

  const isLoadingWpiSpecificaties = isLoading(WPI_SPECIFICATIES);
  const isErrorWpiSpecificaties = isError(WPI_SPECIFICATIES);

  return {
    zaken,
    specificaties,
    jaaropgaven,
    title: themaTitle,
    linkListItems,
    isLoadingWpi,
    isErrorWpi,
    isLoadingWpiSpecificaties,
    isErrorWpiSpecificaties,
    listPageParamKind,
    routes,
    tableConfig,
    breadcrumbs,
  };
}
