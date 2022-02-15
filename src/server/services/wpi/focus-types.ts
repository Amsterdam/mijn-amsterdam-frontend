import { LinkProps } from '../../../universal/types/App.types';

export interface RequestStatusDocument {
  id: string;
  title: string;
  url: string;
  datePublished: string;
}

interface RequestStatusBase<Id extends string> {
  id: Id;
  title: string;
  documents: RequestStatusDocument[];
  datePublished: string;
}

export interface RequestProcess<
  Status extends RequestStatusBase<string>,
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

export type LinkContents<R, T = RequestStatusBase<string>> = (
  requestProcess: R,
  statusStep: Nullable<T>
) => LinkProps;

export interface RequestStatusLabels<R, T = RequestStatusBase<string>> {
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
export type UitkeringRequestProcess = RequestProcess<
  UitkeringRequestStatus,
  UitkeringDecisionId
>;

export type UitkeringRequestStatusStep =
  RequestStatusStep<UitkeringRequestStatus>;

export interface StatusItemRequestProcess extends UitkeringRequestProcess {
  steps: UitkeringRequestStatusStep[];
}

export type UitkeringRequestStatusTitle =
  | 'Uitkering'
  | 'Informatie nodig'
  | 'In behandeling'
  | 'Besluit';

export type UitkeringRequestStatusId =
  | 'aanvraag'
  | 'inBehandeling'
  | 'herstelTermijn'
  | 'besluit';

export type UitkeringDecisionId =
  | 'toekenning'
  | 'afwijzing'
  | 'buitenbehandeling';

type UitkeringRequestStatusBase = RequestStatusBase<UitkeringRequestStatusId>;

export interface UitkeringRequestStatusAanvraag
  extends UitkeringRequestStatusBase {
  id: 'aanvraag';
}

export interface UitkeringRequestStatusInBehandeling
  extends UitkeringRequestStatusBase {
  id: 'inBehandeling';
  dateDecisionExpected: string;
}

export interface UitkeringRequestStatusHerstelTermijn
  extends UitkeringRequestStatusBase {
  id: 'herstelTermijn';
  dateDecisionExpected: string;
  dateUserFeedbackExpected: string;
}

export interface UitkeringRequestStatusDecision
  extends UitkeringRequestStatusBase {
  id: 'besluit';
  decision: UitkeringDecisionId;
}

export type UitkeringRequestStatus =
  | UitkeringRequestStatusAanvraag
  | UitkeringRequestStatusInBehandeling
  | UitkeringRequestStatusHerstelTermijn
  | UitkeringRequestStatusDecision;

export interface BijstandsuitkeringRequestProcessLabels {
  aanvraag: RequestStatusLabels<
    UitkeringRequestProcess,
    UitkeringRequestStatusAanvraag
  >;
  inBehandeling: RequestStatusLabels<
    UitkeringRequestProcess,
    UitkeringRequestStatusInBehandeling
  >;
  herstelTermijn: RequestStatusLabels<
    UitkeringRequestProcess,
    UitkeringRequestStatusHerstelTermijn
  >;
  besluit: RequestStatusLabels<
    UitkeringRequestProcess,
    UitkeringRequestStatusDecision
  >;
}

export type StadspasRequestProcessLabels =
  BijstandsuitkeringRequestProcessLabels;

export type TozoRequestStatusId =
  | 'aanvraag'
  | 'besluit'
  | 'herstelTermijn'
  | 'voorschot'
  | 'intrekking'
  | 'terugvorderingsbesluit'
  | 'inkomstenwijziging';

export type TozoDecisionId = UitkeringDecisionId | 'vrijeBeschikking';

type TozoRequestStatusBase = RequestStatusBase<TozoRequestStatusId> & {
  productSpecific?: 'uitkering' | 'lening';
};

export interface TozoRequestStatusAanvraaag extends TozoRequestStatusBase {
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
  | TozoRequestStatusAanvraaag
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
}

export interface TozoRequestProcessLabels {
  aanvraag: RequestStatusLabels<TozoRequestProcess, TozoRequestStatusAanvraaag>;
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
}

// Bbz
export type BbzRequestStatusId =
  | TozoRequestStatusId
  | 'briefAdviesRapport'
  | 'briefAkteBedrijfskapitaal'
  | 'beslisTermijn';

export type BbzDecisionId = UitkeringDecisionId | 'toekenningVoorlopig'; // IOAZ

type BbzRequestStatusBase = RequestStatusBase<BbzRequestStatusId> & {
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
  | UitkeringDecisionId
  | 'verlenging'
  | 'mogelijkeVerlenging'; // TONK

export type TONKRequestStatusId =
  | TozoRequestStatusId
  | 'correctiemail'
  | 'briefWeigering';

type TONKRequestStatusBase = RequestStatusBase<TONKRequestStatusId> & {
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
    'aanvraag' | 'herstelTermijn' | 'intrekking'
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

export type WpiRequestProcess =
  | UitkeringRequestProcess
  | TozoRequestProcess
  | BbzRequestProcess
  | TONKRequestProcess;

export type WpiRequestProcessLabels =
  | BijstandsuitkeringRequestProcessLabels
  | StadspasRequestProcessLabels
  | TozoRequestProcessLabels
  | BbzRequestProcessLabels
  | TONKRequestProcessLabels;
