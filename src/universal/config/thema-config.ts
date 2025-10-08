// import { ThemaRoutesConfig } from '../../client/config/thema-types';

// // InfoSection: een simpel info-blok met (optionele) titel en lijst
// export type InfoSection = {
//   title?: string; // titel mag leeg zijn;
//   listItems: string[]; // altijd een lijst van tekstjes; dit is zo afgesproken in de opdracht/pseudocode
// };

// // ThemaConfig: basis-gegevens per thema (backend-safe)
// export type ThemaConfig<T = any> = {
//   themaId: string; // uniek id van het thema (bijvoorbeeld:  'BODEM')
//   themaTitle: string; // naam/titel van het thema
//   themaTitleDetail?: string; // ThemaTitleDetail is optioneel. Het wordt niet in elk thema gebruikt
//   profileTypes: ProfileType[]; // wie dit thema mag zien (bijvoorbeeld:  ['private', 'commercial'])
//   featureToggle: { [key: string]: boolean }; // toggles aan/uit (bijvoorbeeld: BodemActive: true })
//   routeConfig: ThemaRoutesConfig; // routes van het thema (detail, lijst, thema)
//   listPageParamKind: {
//     inProgress: 'lopende-aanvragen' | string;
//     completed: 'afgehandelde-aanvragen';
//   };
// };
