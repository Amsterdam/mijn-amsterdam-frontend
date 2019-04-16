# Mijn-Amsterdam Front-end

Hi and welcome to the **Mijn-Amsterdam** front-end repository!

This repo is the main codebase for the web application found at [https://mijn.amsterdam.nl](mijn.amsterdam.nl) which
is a portal for official communication with the municipality of Amsterdam.

### Keypoints

- Typescript SPA
- Boilerplate with `create-react-app`
- Built with `react`
- Uses `scss` for css pre processing
- Uses `css modules` for style composition
- Communication via REST Api

### Development

- Be extra considerate about naming things, discuss with the team if needed. Dutch terms that cannot be easily translated are kept dutch. The rest can be provided in English.
- Write a test when a complex and/or critical component is encountered. We don't require 100% test coverage however...
- Take time to review code. Thorough reviews are a good addition for preventing sloppy code and bugs.
- Try to improve your skills, ask questions, be thoughtful and voice concerns if you have them.

#### Components

Stick to functional react components as much as possible, when you need state within a component
use the hooks api with context provider.

Multiple components/exports per file is ok als long as they are logically grouped and the line count is managable.

A blueprint for basic components can be found in `components/AlphaComponent/`. A blueprint for page components is locataed in `pages/AlphaPage`.
To generate a component based on these blueprints you can either copy/paste rename stuff or use a tool like `npm install -g generact` which can
be used to duplicate any component and assign it a specific name.

### Naming

#### Constants

When creating constants put them in a `Component.constants.js` file. Use `UPPER_SNAKE_CASE` naming. e.g:

```
const Things = { FOO: 'Bar', WHY_NOT_THIS_ONE: 'I don\'t like pink' }
```

#### Typescript

- When dealing with more than a few types, create a `*.types.ts` file. This keeps module files more readable.
- Files that include markup are committed with the `.tsx` extension.
- Generic / global types and interfaces can be put in `App.types.ts`.
- Component props are declared in an interface with a `Props` suffix. e.g `ButtonLinkProps`;

#### Styles

- when component name is `MyComponent`, name your css (modules) file `MyComponent.module.css`

It's possible to use css modules in conjunction with `sass` when this is needed, `npm install node-sass`and
rename your module files to `.scss`

### Tooling

- `node` 8.11.2 or higher (find a stable version)
- we use `create-react-app` as boilerplate for the application.
- `prettier`\* is used as code formatting (styling) tool and is set-up as pre-commit hook
- `.editorconfig`\* is used for setting basic file formatting properties

\*You can find a desired plugin for your IDE or editor that use these files for your convience

### Mock Api

We have a mock api which we try to keep up to date with the connections to the real api.
To run the mock-api run the following command in the console `$ npm run watch:mock-api`. The script depends on `npm install -g nodemon`

Whenever you need to update/add an api look for the correct api mock in `./mock-api` and make your changes.
The server will restart automatically.

Some of the mock-api data might be privacy sensitive and is treated as secure. The data can be found on the shared google drive of the team.
Extract the archive as the `/mock-api/secure-data/` folder. Without these files the mock-api will not work correctly.

### Branch naming + PR

- When creating a new branch, preferably, branch off `master`
- When creating a branch, start the name with a ticket number from Jira e.g: `task/mijn-1234-update-logo`
- If you have work for multple tickets in one branch try to reference a parent ticket, for example a story ticket. `story/mijn-5678-create-constant-files`
- When creating a PR/MR put the ticket number between square brackets like: `[mijn-1234] Some title for your PR`
- Keep commit messages compact en meaningful
- Try to squash commits before merging into master.

## Docker

- `docker build ./ --tag="mijn-amsterdam"`
- `docker run -p 8080:80 -e LOGOUT_URL=test mijn-amsterdam`
