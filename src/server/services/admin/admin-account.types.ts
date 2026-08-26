import z from 'zod';

const MAX_JIRA_API_TOKEN_LENGTH = 512;

export type AccountData = {
  username: string;
  lastSignInDate: string;
  jiraApiToken: string;
};

export const accountUpdateInput = z
  .object({
    jiraApiToken: z.string().max(MAX_JIRA_API_TOKEN_LENGTH),
  })
  .strict();

export type AccountUpdateInput = z.infer<typeof accountUpdateInput>;
