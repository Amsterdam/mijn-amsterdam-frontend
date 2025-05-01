/// <reference types="vite" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// TODO: Add typings for this function
declare module 'slugme';
declare module 'log-that-http';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Nullable<T> = T | null;

type RequestID = string;
type SessionID = string;

type ResolvedType<T> = T extends PromiseLike<infer U> ? U : T;

type ReturnTypeAsync<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : T extends (...args: any) => infer R
    ? R
    : any;

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

interface ImportMeta {
  env: {
    [key: string]: string;
  };
}

// De volgende variabelen worden "statically" replaced door VITE. see also: https://vitejs.dev/guide/env-and-mode.html#html-env-replacement
// OTAP ENV Ontwikkel Test Acceptatie Productie
declare const MA_OTAP_ENV: string;

// Versie nummer uit packages.json
declare const MA_APP_VERSION: string;

// Mode: Development Unittest Production
declare const MA_APP_MODE: string;

// The commit sha
declare const MA_GIT_SHA: string;

// The ID of current build
declare const MA_BUILD_ID: string;
 
declare namespace e {
   interface Router extends core.Router {}
}

declare global {
  declare module 'express-serve-static-core' {
    interface Locals {
      requestID: string;
    }
    interface Router extends any { }
  }
}

