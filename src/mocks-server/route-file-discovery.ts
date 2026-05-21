import { readdir } from 'node:fs/promises';

import { logger } from './logger.ts';
import type { MockRouteDefinition } from './types.ts';

type RouteModule = {
  routes: MockRouteDefinition[];
};

function isRouteModuleFile(fileName: string): boolean {
  return (
    fileName.endsWith('.ts') &&
    !fileName.endsWith('.test.ts') &&
    fileName !== 'index.ts'
  );
}

function toModuleName(fileName: string): string {
  return fileName.replace(/\.ts$/, '');
}

export async function loadRoutes(
  routesDirectoryUrl: URL = new URL('./routes/', import.meta.url)
): Promise<MockRouteDefinition[]> {
  const files = await readdir(routesDirectoryUrl);
  const routeFiles = files.filter(isRouteModuleFile).sort();

  const discoveredRouteLists = await Promise.all(
    routeFiles.map(async (fileName) => {
      const moduleName = toModuleName(fileName);
      const moduleUrl = new URL(`./${fileName}`, routesDirectoryUrl);
      const moduleExports = (await import(
        moduleUrl.href
      )) as Partial<RouteModule>;

      if (!Array.isArray(moduleExports.routes)) {
        throw new Error(
          `Route module "${moduleName}" must export a named "routes" array`
        );
      }

      return moduleExports.routes;
    })
  );

  const routes = discoveredRouteLists.flat();

  logger.info(
    {
      routeModuleCount: routeFiles.length,
      routeCount: routes.length,
      files: routeFiles,
    },
    'discovered mock route modules'
  );

  return routes;
}
