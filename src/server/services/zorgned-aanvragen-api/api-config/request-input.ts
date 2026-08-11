import z from 'zod';

import { ZodValidators } from '../../../helpers/validation.ts';

const bsnInput = ZodValidators.BSN.nonoptional();
const clientInput = z.enum(['WMO', 'LLV', 'HLI']).optional();

const requestInputBase_ = {
  bsn: bsnInput,
  client: clientInput,
};

export const requestInputBase = z.object(requestInputBase_);

const aanvragenRequestInput = z.object({
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

export type AanvragenRequestInputFilters = z.infer<
  typeof aanvragenRequestInput
>;

export const requestInputByClient = {
  WMO: aanvragenRequestInput,
  LLV: z.object({}),
  HLI: z.object({}),
} as const;

export const aanvraagDetailRequestInput = z.object({
  bsn: bsnInput,
  id: z.string().nonoptional(),
});
