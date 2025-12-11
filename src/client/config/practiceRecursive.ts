import { IS_PRODUCTION } from '../../universal/config/env';

type FeatureToggle = {
  active?: boolean;
  [key: string]: FeatureToggle | boolean | undefined;
};

function themaFeatureToggle(obj: FeatureToggle, parentActive = true) {
  // obj = het huidige stukje van mijn feature toggle (bijv. stadspas of regelingen)
  // parentActive = of alles boven dit object "aan" staat (standaard true bij de bovenste)

  // Als dit object zelf een active-waarde heeft (true/false), combineer ik die met de ouder
  if (typeof obj.active === 'boolean')
    parentActive = parentActive && obj.active;

  // Ik sla hier de definitieve active-waarde op voor dit object
  obj.active = parentActive;

  // Hier loop ik langs alle velden in dit object (bijv. children, losse toggles, etc.)
  for (const key in obj) {
    const value = obj[key];

    // Als de waarde een losse boolean is, zorg ik dat die ook niet aan kan staan als de parent uit staat
    if (typeof value === 'boolean') obj[key] = value && parentActive;
    // Als de waarde weer een object is, ga ik daar opnieuw hetzelfde trucje op doen
    else if (value && typeof value === 'object')
      themaFeatureToggle(value as FeatureToggle, parentActive);
  }
  return obj;
}
// pasbyreference of pasbyvalue.

const testToggle = {
  themaActive: false,
  stadspas: {
    active: true,
    hliThemaStadspasBlokkerenActive: false,
    hliThemaStadspasDeblokkerenActive: true,
  },
  PremiumPas: {
    active: false,
    blokkerenPas: true,
  },
  regelingen: {
    active: true,
    hliRegelingEnabledCZM: false,
    hliRegelingEnabledRTM: !IS_PRODUCTION,
    hli2025PCTegoedCodesEnabled: !IS_PRODUCTION,
    hli2026PCVergoedingV3Enabled: !IS_PRODUCTION,
  },
  zorgned: {
    active: true,
  },
};
console.log(themaFeatureToggle(testToggle));
