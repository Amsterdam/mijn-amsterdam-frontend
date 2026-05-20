import type { Request } from 'express';
import formidable, { type Fields } from 'formidable';

export async function parseMultipartForm(req: Request): Promise<Fields> {
  const form = formidable();

  return new Promise<Fields>((resolve, reject) => {
    form.parse(req, (error, fields) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(fields);
    });
  });
}
