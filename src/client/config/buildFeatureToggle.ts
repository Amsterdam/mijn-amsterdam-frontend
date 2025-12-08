import type { ThemaFeatureToggle } from './thema-types';

export function buildFeatureToggle(
  toggle: ThemaFeatureToggle
): ThemaFeatureToggle & Record<string, boolean> {
  const featureToggle = { ...toggle } as ThemaFeatureToggle &
    Record<string, boolean>;

  const parents = toggle.parents;
  if (!parents) {
    return featureToggle;
  }

  for (const parentKey in parents) {
    const parent = parents[parentKey];
    const parentOn = toggle.themaActive && !!parent.active;
    featureToggle[`${parentKey}Active`] = parentOn;

    const children = parent.children ?? {};
    for (const childKey in children) {
      const childValue = !!children[childKey];
      featureToggle[childKey] = parentOn && childValue;
    }
  }
  console.dir(featureToggle, { depth: 10 });
  return featureToggle;
}

buildFeatureToggle({
  themaActive: true,
  parents: {
    stadspas: {
      active: false,
      children: {
        hliThemaStadspasBlokkerenActive: true,
        hliThemaStadspasDeblokkerenActive: true,
      },
      premiumPas: {
        active: true,
        children: {
          premiumPasBlokkeren: true,
          premiumPasDeblokkeren: true,
        },
      },
    },
    // recursie is eeen functie die zichzelf aanroept.
    // dat je hli
    // dat het input object (featuretoggle) dat dat geen parents of children heeft. het thematype dat we gister hebben bepaald dat het dat volgt en er geen dubbele benamingen zijn. dus hli.stadspas.blokkeren(.active of gewoon active)
    // output object is identiek aan het input object, alleen de booleans kunnne veranderen. Voor elke toggle check je de waarde van de parent en de toggle zelf. de builder recursief maar hoeft niet persee zolang het aan het onderstaande voldoet.
    // ongelimiteerde geneste input objecten kunnen verwerken.
    // probeer het eerst werkend te krijgen door misschien het beginnen met een klein object en door het runnen van bun run checken of het werkt.
    // zoek vooral op internet uitleg en voorbeelden over recursief gebruik. kleine tip: begin
    regelingen: {
      active: true,
      children: {
        hliRegelingEnabledCZM: true,
        hliRegelingEnabledRTM: true,
        hli2025PCTegoedCodesEnabled: true,
        hli2026PCVergoedingV3Enabled: true,
      },
    },
    zorgned: {
      active: true,
    },
  },
} as ThemaFeatureToggle);
