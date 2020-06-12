# Add new Chapter:

## In the src/universal folder
- determine name of $CHAPTER
- open src/universal/config/chapter.ts add $CHAPTER and $chapterTitle

# In the src/server folder
- add file in src/server/services/$chapter.ts (use the __service-blueprint.ts file for inspiration or tahe one of the other services as blueprint for this one)
- add the service to the appropriate service-collection (services-direct for independent services, services-map for map data, services-related for dependent data, 
  services-generated for generated notifications, tips, cases derived from the source data)
- add an Api Source Url to src/server/config.ts
- add Mock data entry in src/server/mock-data/index.ts


# In the src/client folder
- in src/client/AppState.ts add the $CHAPTER to the PRISTINE_STATE export
- generact -> AlphaPage -> $Chapter change the component composition to fit your needs (OverviewPage, Detailpage, TextPage)
- open routing.ts add $Chapter -> /$chapter
- open App.tsx add <Route path={AppRoutes.$CHAPTER} component={$Chapter} />
- open src/client/helpers/chapter.ts add your loading conditions in both getMyChapters() and isChapterActive()
- open src/client/config/menuItems.ts and add a Menu Item entry
- open src/client/config/chapterIcons.tsx and add a an Icon (after adding the svg icon to the src/client/assets/icons/index.tsx file)
- open src/client/config/api.ts and add $CHAPTER to the ErrorNames export
 