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
  inputPath?: string;
  envPath: string;
  dryRun: boolean;
};

type JiraConfig = {
  siteUrl: string;
  email: string;
  apiToken: string;
  acceptanceCriteriaFieldId?: string;
};

type IssueType = {
  id: string;
  name: string;
  fields?: Record<string, { name?: string }>;
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

const DEFAULT_PROJECT_KEY = 'MIJN';
const HARDCODED_PARENT_ISSUE_KEY = 'MIJN-124';
const ALLOWED_ISSUE_TYPES = ['story', 'bug', 'spike'] as const;

function printHelp() {
  console.log(`create-jira-ticket.ts

Gebruik:
  node --experimental-strip-types scripts/create-jira-ticket.ts --input <bestand.json> [--env .env.jira] [--dry-run]
  cat payload.json | node --experimental-strip-types scripts/create-jira-ticket.ts [--env .env.jira] [--dry-run]

Opties:
  --input <pad>    Pad naar JSON inputbestand
  --env <pad>      Pad naar env-bestand (default: .env.jira)
  --dry-run        Toon payload en stop zonder Jira-call
  --help           Toon deze help

Verwachte input velden:
  projectKey, issueTypeName (Story|Bug|Spike), parentIssueKey, summary,
  description, acceptanceCriteria, comment
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

    if (arg === '--input') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Argument --input verwacht een pad');
      }
      options.inputPath = value;
      i++;
      continue;
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
  const acceptanceCriteriaFieldId = env.JIRA_ACCEPTANCE_CRITERIA_FIELD_ID;

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
    acceptanceCriteriaFieldId,
  };
}

function normalizeIssueTypeName(value?: string): 'Story' | 'Bug' | 'Spike' {
  const normalized = (value ?? 'Story').trim().toLowerCase();

  if (
    !ALLOWED_ISSUE_TYPES.includes(
      normalized as (typeof ALLOWED_ISSUE_TYPES)[number]
    )
  ) {
    throw new Error('issueTypeName moet Story, Bug of Spike zijn');
  }

  if (normalized === 'story') {
    return 'Story';
  }
  if (normalized === 'bug') {
    return 'Bug';
  }
  return 'Spike';
}

function readInputJson(inputPath?: string): JiraTicketInput {
  let raw = '';

  if (inputPath) {
    if (!existsSync(inputPath)) {
      throw new Error(`Inputbestand niet gevonden: ${inputPath}`);
    }
    raw = readFileSync(inputPath, 'utf8');
  } else {
    if (process.stdin.isTTY) {
      throw new Error(
        'Geen input ontvangen. Gebruik --input of pipe JSON via stdin.'
      );
    }
    raw = readFileSync(0, 'utf8');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Input is geen geldige JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Input moet een JSON object zijn');
  }

  const ticket = parsed as JiraTicketInput;

  if (!ticket.summary || typeof ticket.summary !== 'string') {
    throw new Error('Input mist verplicht veld: summary');
  }

  if (!ticket.description || typeof ticket.description !== 'string') {
    throw new Error('Input mist verplicht veld: description');
  }

  if (
    !ticket.acceptanceCriteria ||
    typeof ticket.acceptanceCriteria !== 'string'
  ) {
    throw new Error('Input mist verplicht veld: acceptanceCriteria');
  }

  normalizeIssueTypeName(ticket.issueTypeName);

  return ticket;
}

function basicAuthHeader(email: string, apiToken: string): string {
  const token = Buffer.from(`${email}:${apiToken}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function jiraApiRequest(
  config: JiraConfig,
  path: string,
  method: 'GET' | 'POST',
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

async function resolveIssueType(
  config: JiraConfig,
  projectKey: string,
  issueTypeName: 'Story' | 'Bug' | 'Spike'
): Promise<IssueType> {
  const createmeta = await jiraApiRequest(
    config,
    `/rest/api/3/issue/createmeta?projectKeys=${encodeURIComponent(projectKey)}&expand=projects.issuetypes.fields`,
    'GET'
  );

  if (!createmeta.ok) {
    throw new Error(
      `Kon issue types niet ophalen (HTTP ${createmeta.status}): ${createmeta.text}`
    );
  }

  const projects =
    (createmeta.json as { projects?: unknown[] })?.projects ?? [];
  const firstProject = projects[0] as
    | {
        issuetypes?: Array<{
          id?: string;
          name?: string;
          fields?: Record<string, { name?: string }>;
        }>;
      }
    | undefined;

  const issueTypes = firstProject?.issuetypes ?? [];
  const matched = issueTypes.find(
    (t) => (t.name ?? '').toLowerCase() === issueTypeName.toLowerCase()
  );

  if (!matched?.id || !matched?.name) {
    const available = issueTypes
      .map((t) => t.name ?? '')
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Issue type ${issueTypeName} niet gevonden in project ${projectKey}. Beschikbaar: ${available}`
    );
  }

  return {
    id: matched.id,
    name: matched.name,
    fields: matched.fields,
  };
}

function normalizeFieldName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveAcceptanceCriteriaFieldId(
  config: JiraConfig,
  issueType: IssueType
): string {
  if (config.acceptanceCriteriaFieldId?.trim()) {
    return config.acceptanceCriteriaFieldId.trim();
  }

  const fields = issueType.fields ?? {};
  const entries = Object.entries(fields);

  for (const [fieldId, fieldMeta] of entries) {
    const normalized = normalizeFieldName(fieldMeta?.name ?? '');
    if (
      normalized.includes('acceptancecriteria') ||
      normalized.includes('acceptatiecriteria')
    ) {
      return fieldId;
    }
  }

  throw new Error(
    'Kon geen acceptatiecriteria veld vinden. Zet JIRA_ACCEPTANCE_CRITERIA_FIELD_ID in .env.jira.'
  );
}

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

async function createIssue(
  config: JiraConfig,
  input: JiraTicketInput,
  options: CliOptions
) {
  const projectKey = input.projectKey ?? DEFAULT_PROJECT_KEY;
  const requestedIssueType = normalizeIssueTypeName(input.issueTypeName);
  const issueType = await resolveIssueType(
    config,
    projectKey,
    requestedIssueType
  );
  const acceptanceCriteriaFieldId = resolveAcceptanceCriteriaFieldId(
    config,
    issueType
  );

  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    issuetype: { id: issueType.id },
    summary: input.summary,
    description: markdownToAdf(input.description),
    parent: { key: HARDCODED_PARENT_ISSUE_KEY },
  };

  fields[acceptanceCriteriaFieldId] = markdownToAdf(input.acceptanceCriteria);

  const payload = { fields };

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          projectKey,
          issueType: { id: issueType.id, name: issueType.name },
          parentIssueKey: HARDCODED_PARENT_ISSUE_KEY,
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
        parentIssueKey: HARDCODED_PARENT_ISSUE_KEY,
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
  const input = readInputJson(options.inputPath);

  await createIssue(config, input, options);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`ERROR: ${message}`);
  process.exit(1);
});
