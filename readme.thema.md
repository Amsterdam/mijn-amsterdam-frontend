# Add new Thema:

Roughly follow the following steps to integrate a new thema into the application.

## In the src/universal folder

- determine name of $CHAPTER
- open src/universal/config/thema.ts add $CHAPTER and $themaTitle

# In the src/server folder

- add file in src/server/services/$thema.ts (use the \_\_service-blueprint.ts or one of the other services for inspiration)
- determine the profile types for the service and integrate in the correct variables/types in `services/controller.ts`
- if the service will have notifications and recent cases also update `services/generated.ts` in a likewise manner as already defined.
- add an Api Source Url to src/server/config.ts `{ [$CHAPTER]: { url: 'https://some/service/endpoint' } }`
- get/create some mock data that will represent the appropriate api response and put in `mock-data/json/$thema.json`
- add Mock data entry in src/server/mock-data/index.ts and load the mock data

# In the src/client folder

- in `src/client/AppState.ts` add the $CHAPTER to the PRISTINE_STATE export
- generact -> AlphaPage/AlphaComponent -> $Thema This will copy a component and save as a new one. You can also just create new file by hand. Whatevery you like
- open `universal/config/routes.ts` add $Thema -> /$thema
- open App.tsx add <Route path={AppRoutes.$CHAPTER} component={$Thema} />
- open src/client/config/menuItems.ts and add a Menu Item entry
- open `src/client/hooks/useThemas.ts` add your loading conditions in the `isChapterActive()` function.
- open src/client/config/themaIcons.tsx and add a an Icon (after adding the svg icon to the src/client/assets/icons/index.tsx file)
- open src/client/config/api.ts and add $CHAPTER to the ErrorNames export
