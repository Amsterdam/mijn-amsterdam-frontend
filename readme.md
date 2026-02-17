# Mijn-Amsterdam Front-end + BFF

Hi and welcome to the **Mijn-Amsterdam** front-end + bff repository!

This repo is the main codebase for the web application found at [mijn.amsterdam.nl](https://mijn.amsterdam.nl) which
is a portal for official communication with the municipality of Amsterdam. The application consists of 2 main parts:

- React application
- Node Express back-end-for-frontend (BFF)

To see the application quickly running locally, clone the repo and cd into the project folder. Inside the project folder create a new file called `.env.local`. Put the keys from `.env.local.template` inside the file AND ask one of the developers for possible additional values.

## Set-up

We use Node, and to install the latest version, follow the instructions in this [Link](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).<br>
Then execute the following commands in a bash terminal to install it and the rest of our dependencies:

```bash
cp -i .env.local.template .env.local
nvm install
pnpm install
```

## Running locally

Put the following commands in your terminal after all dependencies are installed:

```bash
pnpm serve-dev

```

It's also possible to run both the mocks server and bff seperately with:

```bash
pnpm start
pnpm mock-server
pnpm bff-api:watch
```

## Accessibility + Targeted browsers

The Mijn Amsterdam design and development team works hard to ensure mijn.amsterdam.nl is [accessible](https://mijn.amsterdam.nl/toegankelijkheidsverklaring).
Not all browsers in the world are supported. The targeted browsers can be found [here](https://github.com/Amsterdam/mijn-amsterdam-frontend/blob/main/package.json#L34).

## React application

- The language used is `Typescript`
- The application is built and tested with [vite/vitest](https://vitejs.dev/).
- Only functional components are used in combination with the hooks api.
- For styling we use [scss](https://create-react-app.dev/docs/adding-a-sass-stylesheet) and [scss modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet)

There is no super strict convention (yet) for grouping components, functions, types etc. For larger components we might want to separate for example additional components, helpers, config and constants
into other files as done in `src/client/pages/Profile` or `src/server/services/focus`.

## Thema configuration

**TODO: Describe thema concept + creation. See MIJN-11557**

Configuration / static data and other related code for Thema's in the Front-end are put in `$Name-thema-config.ts` and `$Name-render-config.tsx` files.
The render config fields are used for code related to React components where the thema config are intended to be used without React. This way these files can also be imported in the BFF without having that (backend) environment
to be configured for React.

An experimental `$Thema` generator can be found in `/scripts/generate-thema.js`. Use it like `node scripts/generate-thema.js --id $THEMA_ID --title 'Thema readable name' --zaakType $ThemaZaakFrontend --private --commercial --config thema,render`.

The `menuItem` from the render config file must be integrated in the `thema.ts` file to "hook" it into the application. The `$ThemaRoutes` must be integrated into `App.routes.tsx`.

## BFF api

The BFF api is the goto part of the application where we do data fetching, data transformations, short-lived request/response caching, error handling and response formatting.
The codebase is also written in typescript so a compilation step is required for it to work. For development purposes we use `ts-node` which takes care of compiling and running the BFF app.

### Authentication

We use an OIDC idp to authenticate the users via Digid or Eherkenning. The max session duration is 15 \* 60 seconds = 15 minutes. Incoming tokens are verified and passed along with the requests to the microservices.
In the microservices these tokens are verified once more for added security.

### BFF Development api

The BFF also has a router that's intended for development purposes only. Not all api requests are targeted at the BFF api in production, some requests are made to the microservice api's directly.
For this purpose we have a development router with mock endpoints see `router-development.ts`. For example, vergunning documents and resident count are retrieved directly without going through the BFF.
It's basically an additional development server integrated in the BFF api.

## Some code conventions

- Constants are defined in `SCREAMING_SNAKE_CASE`
- Variables that are not re-assigned are always `const`
- Variables that get re-assigned are always `let`
- All filenames in src/server should be `kebab-cased.ts`
- React component Filenames in src/client are `PascalCased.tsx`
- If you have a `TODO:`, provide a ticket number

## Tooling

#### System

- `node`
- `pnpm`
- `typescript`
- `vite`

#### Required IDE plugins

- `prettier` with "format on save" option on.
- `.editorconfig`

#### Testing and development

- `vitest` for BFF development

#### Database

Postgres is used. By default the database connection is not used in local development and faked programatically. To develop/test the database locally, a dockerized postgress instance can be started by running: `docker compose up` and setting the env `BFF_DB_ENABLED` to `true`

### Branch naming + PR

- When creating a new branch, preferably, branch off `main`
- When creating a branch, start the name with a ticket number from Jira e.g: `mijn-1234-update-logo`
- Try to rebase on main and squash commits when PR'ing to it so we keep a fairly clean commit log on Main

### Continuous integration / Continuous deployment

We currently work with a trunk based development approach. [see also](https://trunkbaseddevelopment.com) This means we have relatively short lived branches and only 1 main branch (main)
The main branch should always be production worthy in terms of functionality, stability and code quality.
Every release to production is accompanied with a release tag in the from of: `release-v1.2.3`. Whenever you create a release on Github, the CI/CD pipeline will automatically detect the branch and starts building a release.

### Debugging

To log all debug or higher severity levels of logs.
`export LOG_LEVEL=debug`
See all log levels at https://getpino.io/#/docs/api?id=loggerlevels-object

To log outgoing request urls, headers or bodies set these to true:
`export LOG_THAT_HTTP=true` urls
`export LOG_THAT_HTTP_HEADERS=true` headers
`export LOG_THAT_HTTP_BODY=true` body

We also make use of the debug npm packages. For now the following debug settings possible:

Services:
`DEBUG=vergunningen,decos-service`

Request tooling:`DEBUG=vergunningen,source-api-request:request,source-api-request:cache-hit,source-api-request:cache-key,decos-service`

To log response data from incoming responses before any transformation.
A comma separated list of keywords / pathsegments can be used to log specific requests. For example: zorgned/aanvragen,gpass
`export DEBUG_RESPONSE_DATA=term1,term2` this setting only works in conjunction with `DEBUG=source-api-request:response` and is turned on or added **automatically** when DEBUG_RESPONSE_DATA is defined.

To log request body for outgoing requests. A comma separated list of pathsegments|keywords can be used to log specific requests. For example: personen|ZoekMetAdresseerbaarObjectIdentificatie;keyword2,gpass
`export DEBUG_REQUEST_DATA=path1|term1,term2`. Keywords match any string in the params or body of the request. This setting only works in conjunction with `DEBUG=source-api-request:request` and is turned on or added **automatically** when DEBUG_REQUEST_DATA is defined.

#### React Autologout timer

To debug the autologout timer you can add a localstorage item `AUTO_LOGOUT_TIMER_LOGGING` with value `true`. This enables some logging in the console
that shows information about the timer expiry.

## Guides

### Making use of an ENV variable in frontend

- Add variable to `env.local.template`, prefix variable with `REACT_APP_` (don't forget to add to `env.local` as well)
- Add variable as `build ARG` in Docker file

```
ARG REACT_APP_VARIABLE_NAME=
ENV REACT_APP_VARIABLE_NAME=$REACT_APP_VARIABLE_NAME
```

- Add variable to infra repo for frontend ci/cd

You should now be able to access `import.meta.env.REACT_APP_VARIABLE_NAME`
