import { format } from 'date-fns';
import { Chapters } from '../../../universal/config';
import { API_BASE_PATH } from '../../../universal/config/api';
import { FeatureToggle } from '../../../universal/config/app';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import {
  fetchFOCUSCombined,
  FocusInkomenSpecificatie as FocusInkomenSpecificatieFromSource,
} from './focus-combined';

const DEFAULT_SPECIFICATION_CATEGORY = 'Uitkering';

export interface FocusInkomenSpecificatie
  extends FocusInkomenSpecificatieFromSource {
  displayDatePublished: string;
  notification?: MyNotification;
}

function documentDownloadName(item: FocusInkomenSpecificatieFromSource) {
  return `${format(new Date(item.datePublished), 'yyyy-MM-dd')}-${item.title}`;
}

function transformIncomeSpecificationNotification(
  type: 'jaaropgave' | 'uitkeringsspecificatie',
  item: FocusInkomenSpecificatieFromSource
): MyNotification {
  if (type === 'jaaropgave') {
    return {
      id: 'nieuwe-jaaropgave',
      datePublished: item.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Nieuwe jaaropgave',
      description: `Uw jaaropgave ${
        parseInt(dateFormat(item.datePublished, 'yyyy'), 10) - 1
      } staat voor u klaar.`,
      link: {
        to: item.url,
        title: 'Bekijk jaaropgave',
        download: documentDownloadName(item),
      },
    };
  }
  return {
    id: 'nieuwe-uitkeringsspecificatie',
    datePublished: item.datePublished,
    chapter: Chapters.INKOMEN,
    title: 'Nieuwe uitkeringsspecificatie',
    description: `Uw uitkeringsspecificatie van ${dateFormat(
      item.datePublished,
      'MMMM yyyy'
    )} staat voor u klaar.`,
    link: {
      to: item.url,
      title: 'Bekijk uitkeringsspecificatie',
      download: documentDownloadName(item),
    },
  };
}

function transformIncomSpecificationItem(
  item: FocusInkomenSpecificatieFromSource
): FocusInkomenSpecificatie {
  const displayDatePublished = defaultDateFormat(item.datePublished);
  const url = `${API_BASE_PATH}/${item.url}`;
  const categoryFromSource = item.type;
  return {
    ...item,
    category: categoryFromSource || DEFAULT_SPECIFICATION_CATEGORY,
    type: 'pdf',
    url,
    download: documentDownloadName(item),
    displayDatePublished,
  };
}

export interface FOCUSIncomeSpecificationSourceDataContent {
  jaaropgaven: FocusInkomenSpecificatieFromSource[];
  uitkeringsspecificaties: FocusInkomenSpecificatieFromSource[];
}

export interface IncomeSpecifications {
  jaaropgaven: FocusInkomenSpecificatie[];
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
}

export function transformFOCUSIncomeSpecificationsData(
  responseContent: FOCUSIncomeSpecificationSourceDataContent
) {
  const jaaropgaven = (responseContent.jaaropgaven || [])
    .sort(dateSort('datePublished', 'desc'))
    .map((item) => transformIncomSpecificationItem(item));

  const uitkeringsspecificaties = (
    responseContent.uitkeringsspecificaties || []
  )
    .sort(dateSort('datePublished', 'desc'))
    .map((item) => transformIncomSpecificationItem(item));

  return {
    jaaropgaven,
    uitkeringsspecificaties,
  };
}

export async function fetchFOCUSSpecificaties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const combinedData = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (combinedData.status === 'OK') {
    return apiSuccesResult(
      transformFOCUSIncomeSpecificationsData(combinedData.content)
    );
  }
  return combinedData;
}

export async function fetchFOCUSSpecificationsGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const FOCUS_SPECIFICATIES = await fetchFOCUSSpecificaties(
    sessionID,
    passthroughRequestHeaders
  );
  const notifications: MyNotification[] = [];

  if (FOCUS_SPECIFICATIES.status === 'OK') {
    const {
      jaaropgaven,
      uitkeringsspecificaties,
    } = FOCUS_SPECIFICATIES.content;

    if (!FeatureToggle.focusDocumentDownloadsAlert) {
      if (jaaropgaven.length) {
        notifications.push(
          transformIncomeSpecificationNotification('jaaropgave', jaaropgaven[0])
        );
      }

      if (uitkeringsspecificaties.length) {
        notifications.push(
          transformIncomeSpecificationNotification(
            'uitkeringsspecificatie',
            uitkeringsspecificaties[0]
          )
        );
      }
    } else if (jaaropgaven.length || uitkeringsspecificaties.length) {
      notifications.push({
        chapter: Chapters.INKOMEN,
        datePublished: new Date().toISOString(),
        isAlert: true,
        hideDatePublished: true,
        id: `focus-document-download-notification`,
        title: ``,
        description:
          'Door technische problemen kunt u de brieven van Inkomen en Stadspas op dit moment niet openen en downloaden. Onze excuses voor het ongemak.',
      });
    }

    return apiSuccesResult({
      notifications,
    });
  }

  return apiDependencyError({
    FOCUS_SPECIFICATIES,
  });
}
