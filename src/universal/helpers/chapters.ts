import { ChapterMenuItem, Chapters, FeatureToggle } from '../config';
import { isLoading, isMokum } from '.';
import type { AppState } from '../../client/AppState';

export function isChapterActive(item: ChapterMenuItem, appState: AppState) {
  const {
    WMO,
    WPI_SPECIFICATIES,
    WPI_AANVRAGEN,
    WPI_STADSPAS,
    WPI_TOZO,
    WPI_TONK,
    WPI_BBZ,
    SVWI,
    ERFPACHT,
    ERFPACHTv2,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
    OVERTREDINGEN,
    VERGUNNINGEN,
    SIA,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    MY_LOCATION,
    KVK,
    KREFIA,
    KLACHTEN,
    BEZWAREN,
    HORECA,
    AVG,
    BODEM,
  }: AppState = appState;

  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case Chapters.INKOMEN:
      const { jaaropgaven, uitkeringsspecificaties } =
        WPI_SPECIFICATIES?.content ?? {};
      const hasAanvragen = WPI_AANVRAGEN?.content?.length;
      const hasTozo = !!WPI_TOZO?.content?.length;
      const hasTonk = !!WPI_TONK?.content?.length;
      const hasBbz = !!WPI_BBZ?.content?.length;
      const hasJaaropgaven = !!jaaropgaven?.length;
      const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;

      return (
        !(
          isLoading(WPI_AANVRAGEN) &&
          isLoading(WPI_SPECIFICATIES) &&
          isLoading(WPI_TOZO) &&
          isLoading(WPI_TONK) &&
          isLoading(WPI_BBZ)
        ) &&
        (hasAanvragen ||
          hasTozo ||
          hasTonk ||
          hasJaaropgaven ||
          hasBbz ||
          hasUitkeringsspecificaties)
      );

    case Chapters.SVWI:
      return (
        isAmsterdam &&
        FeatureToggle.svwiLinkActive &&
        SVWI?.content?.isKnown === true
      );

    case Chapters.STADSPAS:
      const hasStadspas =
        !!WPI_STADSPAS?.content?.stadspassen?.length ||
        !!WPI_STADSPAS?.content?.aanvragen?.length;
      const isLoadingStadspas = isLoading(WPI_STADSPAS);
      return !isLoadingStadspas && hasStadspas;

    case Chapters.ZORG:
      return !isLoading(WMO) && !!WMO.content?.length;

    case Chapters.BELASTINGEN:
      // Belastingen always visible if we receive an error from the api
      const belastingenActive =
        FeatureToggle.belastingApiActive && BELASTINGEN?.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true;
      return !isLoading(BELASTINGEN) && belastingenActive;

    case Chapters.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.cleopatraApiActive ? MILIEUZONE.content?.isKnown : false)
      );

    case Chapters.OVERTREDINGEN:
      return (
        !isLoading(OVERTREDINGEN) &&
        (FeatureToggle.cleopatraApiActive && FeatureToggle.overtredingenActive
          ? OVERTREDINGEN.content?.isKnown
          : false)
      );

    case Chapters.SIA:
      const hasSiaItems =
        !!SIA?.content?.open?.items.length ||
        !!SIA?.content?.afgesloten?.items.length;
      return (FeatureToggle.siaActive ? hasSiaItems : false) && !isLoading(SIA);

    case Chapters.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        !isLoading(MY_LOCATION) &&
        isAmsterdam
      );

    case Chapters.ERFPACHT:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.isKnown === true;

    case Chapters.ERFPACHTv2:
      return (
        FeatureToggle.erfpachtV2Active &&
        !isLoading(ERFPACHTv2) &&
        ERFPACHTv2.content !== null &&
        (('dossiers' in ERFPACHTv2.content &&
          !!ERFPACHTv2.content.dossiers.dossiers?.length) ||
          !!ERFPACHTv2.content?.isKnown)
      );

    case Chapters.SUBSIDIE:
      return !isLoading(SUBSIDIE) && SUBSIDIE.content?.isKnown === true;

    case Chapters.BURGERZAKEN:
      const hasIdentiteitsbewijs = !!BRP?.content?.identiteitsbewijzen?.length;
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        hasIdentiteitsbewijs
      );

    case Chapters.BRP:
      return !isLoading(BRP) && !!BRP.content?.persoon;

    case Chapters.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

    case Chapters.KVK:
      return !isLoading(KVK) && !!KVK.content;

    case Chapters.TOERISTISCHE_VERHUUR:
      const { registraties, vergunningen } =
        TOERISTISCHE_VERHUUR?.content ?? {};
      const hasRegistraties = !!registraties?.length;
      const hasVergunningen = !!vergunningen?.length;
      return (
        !isLoading(TOERISTISCHE_VERHUUR) && (hasRegistraties || hasVergunningen)
      );

    case Chapters.KREFIA:
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks;

    case Chapters.PARKEREN:
      return isAmsterdam && FeatureToggle.parkerenActive;

    case Chapters.KLACHTEN:
      return (
        !isLoading(KLACHTEN) &&
        !!KLACHTEN?.content?.klachten.length &&
        FeatureToggle.klachtenActive
      );

    case Chapters.BEZWAREN:
      return (
        !isLoading(BEZWAREN) &&
        !!BEZWAREN?.content?.length &&
        FeatureToggle.bezwarenActive
      );

    case Chapters.HORECA:
      return (
        !isLoading(HORECA) &&
        !!HORECA?.content?.length &&
        FeatureToggle.horecaActive
      );

    case Chapters.AVG:
      return (
        !isLoading(AVG) &&
        !!AVG?.content?.verzoeken?.length &&
        FeatureToggle.avgActive
      );

    case Chapters.BODEM:
      return (
        !isLoading(BODEM) &&
        !!BODEM?.content?.metingen?.length &&
        FeatureToggle.bodemActive
      );
  }

  return false;
}

export function getChapterMenuItemsAppState(
  appState: AppState,
  chapterItems: ChapterMenuItem[]
) {
  return chapterItems
    .filter(
      ({ isAlwaysVisible, hasAppStateValue }) =>
        isAlwaysVisible !== true && hasAppStateValue !== false
    )
    .map(({ id }) => appState[id as keyof AppState])
    .filter((apiState) => !!apiState);
}
