export async function query(queryString: string, values?: any[]) {
  return null;
}

export async function queryGET(queryString: string, values?: any[]) {
  return null;
}

export async function queryALL(queryString: string, values?: any[]) {
  return [];
}

export const id = 'fake-db';

export default {
  id,
  query,
  queryGET,
  queryALL,
};
