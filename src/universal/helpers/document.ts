import { GenericDocument } from '../types/App.types';

/** Create a function to track and then dedupe documents */
export function createDocumentDeduper(): (
  documents: GenericDocument[]
) => GenericDocument[] {
  const seenDocumentIds: Set<string> = new Set();

  function dedupeDocuments(documents: GenericDocument[]) {
    return documents.filter((doc) => {
      const id = doc.title + doc.datePublished;
      const isDuplicate = seenDocumentIds.has(id);
      seenDocumentIds.add(id);
      return !isDuplicate;
    });
  }
  return dedupeDocuments;
}

/** Dedupe documents across multiple datasets by specifying the property where the documents reside. */
export function dedupeDocumentsInDataSets<
  T extends Record<K, GenericDocument[]>,
  K extends keyof T,
>(dataSets: T[], property: K): T[] {
  const dedupeDocuments = createDocumentDeduper();
  return dataSets.map((set) => ({
    ...set,
    [property]: dedupeDocuments(set[property]),
  }));
}
