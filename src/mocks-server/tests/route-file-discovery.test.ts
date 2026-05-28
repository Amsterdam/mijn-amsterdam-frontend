import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../logger.ts';
import { loadRoutes } from '../route-file-discovery.ts';

describe('loadRoutes', () => {
  const createdDirs: string[] = [];
  const routesDir = fileURLToPath(new URL('.', import.meta.url));

  afterEach(async () => {
    await Promise.all(
      createdDirs.splice(0).map((dir) =>
        rm(dir, {
          recursive: true,
          force: true,
        })
      )
    );
  });

  it('loads and flattens routes from discovered route modules', async () => {
    const loggerSpy = vi
      .spyOn(logger, 'debug')
      .mockImplementation(() => logger);
    const tempDir = await mkdtemp(path.join(routesDir, '__tmp-routes-'));
    createdDirs.push(tempDir);

    await writeFile(
      path.join(tempDir, 'alpha.ts'),
      `
        export const routes = [
          {
            id: 'alpha-route',
            url: '/alpha',
            method: 'GET',
            handler: {
              type: 'json',
              status: 200,
              body: { ok: true }
            }
          }
        ];
      `
    );

    await writeFile(
      path.join(tempDir, 'beta.ts'),
      `
        export const routes = [
          {
            id: 'beta-route',
            url: '/beta',
            method: 'POST',
            handler: {
              type: 'json',
              status: 201,
              body: { ok: true }
            }
          }
        ];
      `
    );

    await writeFile(
      path.join(tempDir, 'alpha.test.ts'),
      'export const notRoutes = [];'
    );

    const routes = await loadRoutes(pathToFileURL(`${tempDir}${path.sep}`));

    expect(routes).toHaveLength(2);
    expect(routes.map((route) => route.id).sort()).toEqual([
      'alpha-route',
      'beta-route',
    ]);
    expect(loggerSpy).toHaveBeenCalledWith(
      {
        routeModuleCount: 2,
        routeCount: 2,
        files: ['alpha.ts', 'beta.ts'],
      },
      'discovered mock route modules'
    );

    loggerSpy.mockRestore();
  });

  it('fails fast when a module is missing the named routes export', async () => {
    const tempDir = await mkdtemp(
      path.join(routesDir, '__tmp-routes-invalid-')
    );
    createdDirs.push(tempDir);

    await writeFile(
      path.join(tempDir, 'broken.ts'),
      'export const notRoutes = [];'
    );

    await expect(
      loadRoutes(pathToFileURL(`${tempDir}${path.sep}`))
    ).rejects.toThrow(
      'Route module "broken" must export a named "routes" array'
    );
  });
});
