#!/usr/bin/env -S node --experimental-strip-types

import { existsSync, readFileSync } from 'node:fs';

type JiraTicketInput = {
  projectKey?: string;
  issueTypeName?: string;
  parentIssueKey?: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
  comment?: string;
};

type CliOptions = {
  envPath: string;
  dryRun: boolean;
};

type JiraConfig = {
  siteUrl: string;
  email: string;
  apiToken: string;
};

type CreateIssueResult = {
  id: string;
  key: string;
};

type AdfNode = Record<string, unknown>;

type AdfDoc = {
  type: 'doc';
  version: 1;
  content: AdfNode[];
};

const JIRA_TICKET_CONFIG = {
  defaults: {
    projectKey: 'MIJN',
    issueType: {
      id: '7',
      name: 'Story' as const,
    },
    acceptanceCriteriaFieldId: 'customfield_13007',
  },
  allowedIssueTypeNames: ['story'] as const,
  requiredStringFields: [
    'summary',
    'description',
    'acceptanceCriteria',
  ] as const,
};

type RequiredStringInputField =
  (typeof JIRA_TICKET_CONFIG.requiredStringFields)[number];

function printHelp() {
  console.log(`create-jira-ticket.ts

Gebruik:
  cat payload.json | node --experimental-strip-types scripts/create-jira-ticket.ts [--env .env.jira] [--dry-run]

Opties:
  --env <pad>      Pad naar env-bestand (default: .env.jira)
  --dry-run        Toon payload en stop zonder Jira-call
  --help           Toon deze help

Verwachte input velden:
  projectKey, summary,
  description, acceptanceCriteria, comment

Optioneel input velden:
  parentIssueKey
`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    envPath: '.env.jira',
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg === '--env') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Argument --env verwacht een pad');
      }
      options.envPath = value;
      i++;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Onbekend argument: ${arg}`);
  }

  return options;
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    throw new Error(`Env-bestand niet gevonden: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2] ?? '';

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function getJiraConfig(envPath: string): JiraConfig {
  const env = parseEnvFile(envPath);

  const baseUrl = env.JIRA_BASE_URL;
  const email = env.JIRA_EMAIL;
  const apiToken = env.JIRA_API_TOKEN;

  if (!baseUrl) {
    throw new Error('JIRA_BASE_URL ontbreekt in env-bestand');
  }
  if (!email) {
    throw new Error('JIRA_EMAIL ontbreekt in env-bestand');
  }
  if (!apiToken) {
    throw new Error('JIRA_API_TOKEN ontbreekt in env-bestand');
  }

  let siteUrl: string;
  try {
    siteUrl = new URL(baseUrl).origin;
  } catch {
    throw new Error(`Ongeldige JIRA_BASE_URL: ${baseUrl}`);
  }

  return {
    siteUrl,
    email,
    apiToken,
  };
}

function validateTicketInput(input: JiraTicketInput): JiraTicketInput {
  for (const fieldName of JIRA_TICKET_CONFIG.requiredStringFields) {
    const value = input[fieldName as RequiredStringInputField];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Input mist verplicht veld: ${fieldName}`);
    }
  }

  return input;
}

function readInputJson(): JiraTicketInput {
  if (process.stdin.isTTY) {
    throw new Error('Geen input ontvangen. Pipe JSON via stdin.');
  }

  const raw = readFileSync(0, 'utf8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Input is geen geldige JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Input moet een JSON object zijn');
  }

  return validateTicketInput(parsed as JiraTicketInput);
}

function basicAuthHeader(email: string, apiToken: string): string {
  const token = Buffer.from(`${email}:${apiToken}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function jiraApiRequest(
  config: JiraConfig,
  path: string,
  method: 'POST',
  body?: unknown
) {
  const response = await fetch(`${config.siteUrl}${path}`, {
    method,
    headers: {
      Authorization: basicAuthHeader(config.email, config.apiToken),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let json: unknown = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  return {
    status: response.status,
    ok: response.ok,
    json,
    text,
  };
}

async function createIssue(
  config: JiraConfig,
  input: JiraTicketInput,
  options: CliOptions
) {
  const projectKey = input.projectKey ?? JIRA_TICKET_CONFIG.defaults.projectKey;
  const parentIssueKey = input.parentIssueKey?.trim();
  const issueType = JIRA_TICKET_CONFIG.defaults.issueType;
  const acceptanceCriteriaFieldId =
    JIRA_TICKET_CONFIG.defaults.acceptanceCriteriaFieldId;

  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    issuetype: { id: issueType.id },
    summary: input.summary,
    description: markdownToAdf(input.description),
    [acceptanceCriteriaFieldId]: markdownToAdf(input.acceptanceCriteria),
  };

  if (parentIssueKey) {
    fields.parent = { key: parentIssueKey };
  }

  const payload = { fields };

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          projectKey,
          issueType: { id: issueType.id, name: issueType.name },
          ...(parentIssueKey ? { parentIssueKey } : {}),
          payload,
        },
        null,
        2
      )
    );
    return;
  }

  const createResponse = await jiraApiRequest(
    config,
    '/rest/api/3/issue',
    'POST',
    payload
  );

  if (createResponse.status !== 201) {
    throw new Error(
      `Ticket aanmaken mislukt (HTTP ${createResponse.status}): ${createResponse.text}`
    );
  }

  const created = createResponse.json as CreateIssueResult;
  if (!created?.key || !created?.id) {
    throw new Error('Jira response mist issue key/id');
  }

  let commentAdded = false;
  if (input.comment?.trim()) {
    const commentResponse = await jiraApiRequest(
      config,
      `/rest/api/3/issue/${encodeURIComponent(created.key)}/comment`,
      'POST',
      { body: markdownToAdf(input.comment.trim()) }
    );

    if (!commentResponse.ok) {
      throw new Error(
        `Comment toevoegen mislukt (HTTP ${commentResponse.status}): ${commentResponse.text}`
      );
    }

    commentAdded = true;
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        issueKey: created.key,
        issueId: created.id,
        issueUrl: `${config.siteUrl}/browse/${created.key}`,
        projectKey,
        issueType: { id: issueType.id, name: issueType.name },
        ...(parentIssueKey ? { parentIssueKey } : {}),
        acceptanceCriteriaFieldId,
        commentAdded,
      },
      null,
      2
    )
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = getJiraConfig(options.envPath);
  const input = readInputJson();

  await createIssue(config, input, options);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ERROR: ${message}`);
  process.exit(1);
});

/*
 * Markdown to ADF conversion helper logic
 */
function textNodes(text: string) {
  if (!text) {
    return [] as AdfNode[];
  }
  return [{ type: 'text', text }] as AdfNode[];
}

function paragraphNode(text: string): AdfNode {
  return {
    type: 'paragraph',
    content: textNodes(text),
  };
}

function headingNode(level: number, text: string): AdfNode {
  return {
    type: 'heading',
    attrs: { level },
    content: textNodes(text),
  };
}

function orderedListNode(items: string[]): AdfNode {
  return {
    type: 'orderedList',
    attrs: { order: 1 },
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraphNode(item)],
    })),
  };
}

function codeBlockNode(code: string, language?: string): AdfNode {
  const node: AdfNode = {
    type: 'codeBlock',
    content: textNodes(code),
  };

  if (language) {
    node.attrs = { language };
  }

  return node;
}

function isBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^```/.test(line.trim())
  );
}

function markdownToAdf(markdown: string): AdfDoc {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const content: AdfNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (!line.trim()) {
      i++;
      continue;
    }

    const codeStart = line.trim().match(/^```([a-zA-Z0-9_-]+)?\s*$/);
    if (codeStart) {
      const language = codeStart[1];
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++;
      }
      content.push(codeBlockNode(codeLines.join('\n'), language));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length);
      content.push(headingNode(level, heading[2].trim()));
      i++;
      continue;
    }

    const listItem = line.match(/^\d+\.\s+(.*)$/);
    if (listItem) {
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i].match(/^\d+\.\s+(.*)$/);
        if (!current) {
          break;
        }
        items.push(current[1].trim());
        i++;
      }
      content.push(orderedListNode(items));
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    content.push(paragraphNode(paragraphLines.join(' ')));
  }

  return {
    type: 'doc',
    version: 1,
    content: content.length ? content : [paragraphNode('')],
  };
}
