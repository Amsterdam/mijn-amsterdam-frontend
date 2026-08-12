import z from 'zod';

import { ZodValidators } from '../../../helpers/validation.ts';

const bsnInput = ZodValidators.BSN.nonoptional();
const clientInput = z.enum(['WMO', 'LLV', 'HLI']).optional();

const requestInputBase_ = {
  bsn: bsnInput,
  client: clientInput,
};

export const requestInputBase = z.object(requestInputBase_);

const wmoInputFilters = z.object({
  maActies: z
    .array(
      z.enum([
        'reparatieverzoek',
        'stopzetten',
        'stopzetten-tijdelijk',
        'stopzetten-niet-via-formulier',
      ])
    )
    .optional(),
  maProductgroep: z
    .array(
      z.enum([
        'WRA',
        'hulpmiddelen',
        'diensten',
        'PGB',
        'vergoeding',
        'AOV',
        'Alle afgewezen',
      ])
    )
    .optional(),
});

const hliInputFilters = z.object({
  maActies: z.array(z.enum(['stadspas-verlengen'])).optional(),
  maProductgroep: z.array(z.enum(['stadspas'])).optional(),
});

export type AanvragenRequestInputFilters = {
  maActies?: string[];
  maProductgroep?: string[];
};

export const requestInputByClient = {
  WMO: wmoInputFilters,
  LLV: z.object({}),
  HLI: hliInputFilters,
} as const;

export const aanvraagDetailRequestInput = z.object({
  bsn: bsnInput,
  id: z.string().nonoptional(),
});
