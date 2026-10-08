import z from 'zod';

const MAX_JIRA_API_TOKEN_LENGTH = 512;

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
    jiraApiToken: z.string().max(MAX_JIRA_API_TOKEN_LENGTH),
  })
  .strict();

export type AccountUpdateInput = z.infer<typeof accountUpdateInput>;
