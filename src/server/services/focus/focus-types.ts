import { LinkProps } from '../../../universal/types/App.types';

export interface RequestStatusDocument {
  id: string;
  title: string;
  url: string;
  datePublished: string;
}

interface RequestStatusBase<Id extends string, Title extends string> {
  id: Id;
  title: Title;
  documents: RequestStatusDocument[];
  datePublished: string;
}

export interface RequestProcess<
  Status extends RequestStatusBase<string, string>,
  DecisionId
> {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string | null;
  datePublished: string; // Date of latest step
  steps: Status[];
  status: Status['id'];
  decision?: DecisionId | null;
}

export type TextPartContents<R, T> = (
  requestProcess: R,
  statusStep: Nullable<T>
) => string;

export type LinkContents<R, T = RequestStatusBase<string, string>> = (
  requestProcess: R,
  statusStep: Nullable<T>
) => LinkProps;

export interface RequestStatusLabels<R, T = RequestStatusBase<string, string>> {
  description: TextPartContents<R, T>;
  notification: {
    title: TextPartContents<R, T>;
    description: TextPartContents<R, T>;
    link?: LinkContents<T>;
  };
}

type RequestStatusStep<R> = R & {
  isActive?: boolean;
  isChecked?: boolean;
};

/**
 * Specific process configurations
 */

// Bijstandsuitkering + Stadspas
export type AanvraagRequestProcess = RequestProcess<
  AanvraagRequestStatus,
  AanvraagDecisionId
>;

export type AanvraagRequestStatusStep =
  RequestStatusStep<AanvraagRequestStatus>;

export interface StatusItemRequestProcess extends AanvraagRequestProcess {
  steps: AanvraagRequestStatusStep[];
  link: LinkProps;
}

export type AanvraagRequestStatusTitle =
  | 'Aanvraag'
  | 'Informatie nodig'
  | 'In behandeling'
  | 'Besluit';

export type AanvraagRequestStatusId =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'besluit';

export type AanvraagDecisionId =
  | 'toekenning'
  | 'afwijzing'
  | 'buitenbehandeling';

type AanvraagRequestStatusBase = RequestStatusBase<
  AanvraagRequestStatusId,
  AanvraagRequestStatusTitle
>;

export interface AanvraagRequestStatusAanvraag
  extends AanvraagRequestStatusBase {
  id: 'aanvraag';
}

export interface AanvraagRequestStatusInBehandeling
  extends AanvraagRequestStatusBase {
  id: 'inBehandeling';
  dateDecisionExpected: string;
}

export interface AanvraagRequestStatusHerstelTermijn
  extends AanvraagRequestStatusBase {
  id: 'herstelTermijn';
  dateDecisionExpected: string;
  dateUserFeedbackExpected: string;
}

export interface AanvraagRequestStatusDecision
  extends AanvraagRequestStatusBase {
  id: 'besluit';
  decision: AanvraagDecisionId;
}

export type AanvraagRequestStatus =
  | AanvraagRequestStatusAanvraag
  | AanvraagRequestStatusInBehandeling
  | AanvraagRequestStatusHerstelTermijn
  | AanvraagRequestStatusDecision;

export interface BijstandsuitkeringRequestProcessLabels {
  aanvraag: RequestStatusLabels<
    AanvraagRequestProcess,
    AanvraagRequestStatusAanvraag
  >;
  inBehandeling: RequestStatusLabels<
    AanvraagRequestProcess,
    AanvraagRequestStatusInBehandeling
  >;
  herstelTermijn: RequestStatusLabels<
    AanvraagRequestProcess,
    AanvraagRequestStatusHerstelTermijn
  >;
  besluit: RequestStatusLabels<
    AanvraagRequestProcess,
    AanvraagRequestStatusDecision
  >;
  link: LinkContents<AanvraagRequestProcess>;
}

export type StadspasRequestProcessLabels =
  BijstandsuitkeringRequestProcessLabels;

// TOZO, BBZ, TONK
export type TozoRequestStatusTitle =
  | 'Aanvraag'
  | 'Informatie nodig'
  | 'Voorschot'
  | 'Terugvorderings- besluit'
  | 'Wijziging inkomsten'
  | 'Brief'
  | 'Besluit';

export type TozoRequestStatusId =
  | 'aanvraag'
  | 'besluit'
  | 'herstelTermijn'
  | 'voorschot'
  | 'intrekking'
  | 'terugvorderingsbesluit'
  | 'inkomstenwijziging';

export type TozoDecisionId = AanvraagDecisionId | 'vrijeBeschikking';

type TozoRequestStatusBase = RequestStatusBase<
  TozoRequestStatusId,
  TozoRequestStatusTitle
> & {
  productSpecific?: 'uitkering' | 'lening';
};

export interface TozoRequestStatusAanvraag extends TozoRequestStatusBase {
  id: 'aanvraag';
}

export interface TozoRequestStatusVoorschot extends TozoRequestStatusBase {
  id: 'voorschot';
}

export interface TozoRequestStatusTerugvorderingsBesluit
  extends TozoRequestStatusBase {
  id: 'terugvorderingsbesluit';
}

export interface TozoRequestStatusHerstelTermijn extends TozoRequestStatusBase {
  id: 'herstelTermijn';
}

export interface TozoRequestStatusInkomstenwijziging
  extends TozoRequestStatusBase {
  id: 'inkomstenwijziging';
}

export interface TozoRequestStatusDecision extends TozoRequestStatusBase {
  id: 'besluit';
  decision: TozoDecisionId;
}

export interface TozoRequestStatusIntrekking extends TozoRequestStatusBase {
  id: 'intrekking';
}

export type TozoRequestStatus =
  | TozoRequestStatusAanvraag
  | TozoRequestStatusVoorschot
  | TozoRequestStatusHerstelTermijn
  | TozoRequestStatusDecision
  | TozoRequestStatusInkomstenwijziging
  | TozoRequestStatusIntrekking
  | TozoRequestStatusTerugvorderingsBesluit;

export type TozoRequestProcess = RequestProcess<
  TozoRequestStatus,
  TozoDecisionId
>;

export type TozoRequestStatusStep = RequestStatusStep<TozoRequestStatus>;

export interface StatusItemRequestProcessTozo extends TozoRequestProcess {
  steps: TozoRequestStatusStep[];
  link: LinkProps;
}

export interface TozoRequestProcessLabels {
  aanvraag: RequestStatusLabels<TozoRequestProcess, TozoRequestStatusAanvraag>;
  voorschot: RequestStatusLabels<
    TozoRequestProcess,
    TozoRequestStatusVoorschot
  >;
  herstelTermijn: RequestStatusLabels<
    TozoRequestProcess,
    TozoRequestStatusHerstelTermijn
  >;
  terugvorderingsbesluit: RequestStatusLabels<
    TozoRequestProcess,
    TozoRequestStatusTerugvorderingsBesluit
  >;
  inkomstenwijziging: RequestStatusLabels<
    TozoRequestProcess,
    TozoRequestStatusInkomstenwijziging
  >;
  besluit: RequestStatusLabels<TozoRequestProcess, TozoRequestStatusDecision>;
  intrekking: RequestStatusLabels<
    TozoRequestProcess,
    TozoRequestStatusIntrekking
  >;
  link: LinkContents<TozoRequestProcess>;
}

// Bbz
export type BbzRequestStatusId =
  | TozoRequestStatusId
  | 'briefAdviesRapport'
  | 'briefAkteBedrijfskapitaal'
  | 'beslisTermijn';

export type BbzRequestStatusTitle =
  | TozoRequestStatusTitle
  | 'Brief'
  | 'Akte'
  | 'Tijd nodig';

export type BbzDecisionId = AanvraagDecisionId | 'toekenningVoorlopig'; // IOAZ

type BbzRequestStatusBase = RequestStatusBase<
  BbzRequestStatusId,
  BbzRequestStatusTitle
> & {
  productSpecific?: 'uitkering' | 'lening';
};

export interface BbzRequestStatusBriefAdviesRapport
  extends BbzRequestStatusBase {
  id: 'briefAdviesRapport';
}

export interface BbzRequestStatusBriefAkteBedrijfskapitaal
  extends BbzRequestStatusBase {
  id: 'briefAkteBedrijfskapitaal';
}

export interface BbzRequestStatusBeslisTermijn extends BbzRequestStatusBase {
  id: 'beslisTermijn';
}

export interface BbzRequestStatusDecision extends BbzRequestStatusBase {
  id: 'besluit';
  decision: BbzDecisionId;
}

export type BbzRequestStatus =
  | TozoRequestStatus
  | BbzRequestStatusBriefAdviesRapport
  | BbzRequestStatusBriefAkteBedrijfskapitaal
  | BbzRequestStatusBeslisTermijn;

export type BbzRequestProcess = RequestProcess<BbzRequestStatus, BbzDecisionId>;

export interface BbzRequestProcessLabels
  extends Pick<
    TozoRequestProcessLabels,
    | 'aanvraag'
    | 'voorschot'
    | 'herstelTermijn'
    | 'terugvorderingsbesluit'
    | 'inkomstenwijziging'
    | 'intrekking'
    | 'link'
  > {
  briefAdviesRapport: RequestStatusLabels<
    BbzRequestProcess,
    BbzRequestStatusBriefAdviesRapport
  >;
  briefAkteBedrijfskapitaal: RequestStatusLabels<
    BbzRequestProcess,
    BbzRequestStatusBriefAkteBedrijfskapitaal
  >;
  beslisTermijn: RequestStatusLabels<
    BbzRequestProcess,
    BbzRequestStatusBeslisTermijn
  >;
  besluit: RequestStatusLabels<BbzRequestProcess, BbzRequestStatusDecision>;
}

// TONK
export type TONKDecisionId =
  | AanvraagDecisionId
  | 'verlenging'
  | 'mogelijkeVerlenging'; // TONK

export type TONKRequestStatusId =
  | TozoRequestStatusId
  | 'correctiemail'
  | 'briefWeigering';

export type TONKRequestStatusTitle = TozoRequestStatusTitle | 'Brief' | 'Mail';

type TONKRequestStatusBase = RequestStatusBase<
  TONKRequestStatusId,
  TONKRequestStatusTitle
> & {
  productSpecific: 'uitkering';
};

export interface TONKRequestStatusCorrectieMail extends TONKRequestStatusBase {
  id: 'correctiemail';
}

export interface TONKRequestStatusBriefWeigering extends TONKRequestStatusBase {
  id: 'briefWeigering';
}

export interface TONKRequestStatusDecision extends TONKRequestStatusBase {
  id: 'besluit';
  decision: TONKDecisionId;
}

export type TONKRequestStatus =
  | TozoRequestStatus
  | TONKRequestStatusCorrectieMail
  | TONKRequestStatusBriefWeigering;

export type TONKRequestProcess = RequestProcess<
  TONKRequestStatus,
  TONKDecisionId
>;

export interface TONKRequestProcessLabels
  extends Pick<
    TozoRequestProcessLabels,
    'aanvraag' | 'herstelTermijn' | 'intrekking' | 'link'
  > {
  correctiemail: RequestStatusLabels<
    TONKRequestProcess,
    TONKRequestStatusCorrectieMail
  >;
  briefWeigering: RequestStatusLabels<
    TONKRequestProcess,
    TONKRequestStatusBriefWeigering
  >;
  besluit: RequestStatusLabels<TONKRequestProcess, TONKRequestStatusDecision>;
}
