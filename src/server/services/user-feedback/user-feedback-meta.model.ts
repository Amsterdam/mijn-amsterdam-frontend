import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { toMetaData } from './user-feedback-meta.helpers.ts';
import type { UserFeedbackAdministrationMeta } from './user-feedback.types.ts';
import { getPool } from '../db/postgres.ts';
import { userFeedbackMetaTable } from '../db/schema/user-feedback-meta.ts';

function getDrizzleDb() {
  return drizzle(getPool());
}

const userFeedbackMetaSelect = {
  id: userFeedbackMetaTable.id,
  entryId: userFeedbackMetaTable.entryId,
  dateCreated: userFeedbackMetaTable.dateCreated,
  dateModified: userFeedbackMetaTable.dateModified,
  jiraTicketNumber: userFeedbackMetaTable.jiraTicketNumber,
  departmentName: userFeedbackMetaTable.departmentName,
  departmentEmail: userFeedbackMetaTable.departmentEmail,
};

export async function getUserFeedbackMetaByEntryId(entryId: number) {
  const drizzleDb = getDrizzleDb();
  const rows = await drizzleDb
    .select(userFeedbackMetaSelect)
    .from(userFeedbackMetaTable)
    .where(eq(userFeedbackMetaTable.entryId, entryId))
    .limit(1);

  const [row] = rows;
  return row ? toMetaData(row) : null;
}

export async function getUserFeedbackMetaByEntryIds(entryIds: number[]) {
  if (entryIds.length === 0) {
    return new Map<number, UserFeedbackAdministrationMeta>();
  }

  const drizzleDb = getDrizzleDb();
  const rows = await drizzleDb
    .select(userFeedbackMetaSelect)
    .from(userFeedbackMetaTable)
    .where(inArray(userFeedbackMetaTable.entryId, entryIds));

  return new Map(
    rows.map((row) => {
      const meta = toMetaData(row);
      return [meta.entryId, meta] as const;
    })
  );
}

export async function upsertAdministrationMeta(
  entryId: number,
  metadata: Partial<
    Omit<
      UserFeedbackAdministrationMeta,
      'dateCreated' | 'dateModified' | 'id' | 'entryId'
    >
  >
) {
  const drizzleDb = getDrizzleDb();

  const [row] = await drizzleDb
    .insert(userFeedbackMetaTable)
    .values({
      entryId,
      dateCreated: new Date(),
      dateModified: new Date(),
      ...metadata,
    })
    .onConflictDoUpdate({
      target: userFeedbackMetaTable.entryId,
      set: {
        dateModified: new Date(),
        ...metadata,
      },
    })
    .returning(userFeedbackMetaSelect);

  if (!row) {
    throw new Error('Failed to upsert user feedback department metadata');
  }

  return toMetaData(row);
}
