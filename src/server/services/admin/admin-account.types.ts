import { Buffer } from 'node:buffer';

import z from 'zod';

const MAX_JIRA_API_TOKEN_BYTE_LENGTH = 367;

type ApiTokenEncrypted = string;
type ApiTokenDecrypted = string;

export type AccountRow = {
  username: string;
  jiraApiToken: ApiTokenEncrypted | '';
  lastSignInDate: Date;
};

export type AccountData = {
  username: string;
  lastSignInDate: string;
  jiraApiToken: ApiTokenDecrypted;
};

export const accountUpdateInput = z
  .object({
    jiraApiToken: z
      .string()
      .max(MAX_JIRA_API_TOKEN_BYTE_LENGTH)
      .refine(
        (token) =>
          Buffer.byteLength(token, 'utf8') <= MAX_JIRA_API_TOKEN_BYTE_LENGTH,
        `Token must be at most ${MAX_JIRA_API_TOKEN_BYTE_LENGTH} UTF-8 bytes`
      ),
  })
  .strict();

export type AccountUpdateInput = z.infer<typeof accountUpdateInput>;
