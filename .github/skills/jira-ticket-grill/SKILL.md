---
name: jira-ticket-grill
description: 'Werk een ticket-idee uit tot een compact Nederlands Jira-concept.'
disable-model-invocation: true
---

# JIRA Ticket Grill

## Doel

Zet een vaag ticket-idee om naar een compacte, invulklare JIRA-tickettekst.

Deze skill is bedoeld als snelle verkenning om complexiteit in te schatten, niet als volledige uitwerking.

## Kernflow

1. Herhaal het beoogde doel in 1-2 zinnen.
2. Inspecteer eerst relevante code, paden en bestaande namen; vraag alleen wat niet uit code/context af te leiden is.
3. Stel maximaal 3 impactvragen totaal, exact 1 vraag per beurt, in deze volgorde: architectuur/scope, data/model, delivery/risico.
4. Gebruik waar mogelijk multiple-choice in plaats van open vragen.
5. Maak aannames expliciet als "Aanname" en vat keuzes samen als gedrag + reden (reden alleen als gebruiker die expliciet geeft).
6. Schrijf voor een medior ontwikkelaar met enige codebase-ervaring.
7. Lever een conceptticket op volgens `Outputcontract` en eindig met: "Klopt dit zo?"
8. Als de gebruiker aangeeft dat iets mist of niet klopt: stel maximaal 1 extra verduidelijkingsvraag, inspecteer opnieuw waar nodig, lever een herzien concept en vraag opnieuw: "Klopt dit zo?"
9. Alleen bij expliciete "ja": maak direct het ticket aan via `jira-ticket-create`.

## Snelheids-gate

De sessie is geslaagd als dit minimaal duidelijk is:

1. Probleem en impact.
2. Gewenst gedrag op hoofdlijnen.
3. Scopegrenzen.
4. Grootste technische risico.

## Outputcontract

Gebruik exact deze headings in deze volgorde:

# Description

## Korte samenvatting

## Huidige situatie

## Gewenste situatie/gedrag

## Functionele beschrijving

## Onduidelijkheden en afhankelijkheden

## Relevante achtergrond informatie

# Acceptatiecriteria

## Kwaliteit en borging

Regels:

1. Houd het compact en impactgericht; volledigheid is hier niet het doel.
2. Gebruik genummerde lijsten over bullet points.
3. Gebruik korte, toetsbare acceptatiecriteria.
4. Noem rollout/feature flag of backward compatibility alleen als relevant.
5. `## Onduidelijkheden en afhankelijkheden` bevat alleen echte open punten/afhankelijkheden; anders exact: "Geen bekende onduidelijkheden of afhankelijkheden op dit moment.".

## Plan-validatie met code (verplicht)

Aan het einde valideer je het voorstel expliciet tegen de codebase:

1. Houd het hele conceptticket tegen de codebase, niet alleen losse onderdelen.
2. Verifieer elke concrete referentie in het plan: database tabellen/kolommen, routes/endpoints, bestaande flows, services, modules/functies en paden.
3. Markeer per referentie de status: bevestigd, niet gevonden, of gedrag wijkt af van wat de tickettekst impliceert.
4. Controleer bij verwijzing naar bestaand gedrag ook de semantiek: als het ticket zegt "we loggen uit via de bestaande consumer logout flow", moet die flow bestaan en functioneel overeenkomen met die claim.
5. Als een referentie niet gevonden wordt of het gedrag afwijkt, zet dit expliciet onder `## Onduidelijkheden en afhankelijkheden` met impact op scope/risico en label dit als "Aanname" of open punt.
6. Stel alleen als nodig een laatste verduidelijkingsvraag voordat ticketaanmaak start.
7. Rond af volgens `Outputcontract` (inclusief: "Klopt dit zo?").

## Standaardinhoud per sectie

1. Korte samenvatting: schrijf 2-4 zinnen met in deze volgorde kernwijziging, probleem/doel, verwacht effect en scope. Houd alleen de kern; geen technische keuzes, afhankelijkheden of risico's.
2. Huidige situatie: beschrijf in 2-4 genummerde punten wat er nu gebeurt, inclusief knelpunt en impact.
3. Gewenste situatie/gedrag: beschrijf in 2-4 genummerde punten het gewenste gedrag binnen deze ticket-scope.
4. Functionele beschrijving: beschrijf in 2-10 genummerde punten het functionele gedrag, bij voorkeur rond 5 punten, met structuur: Als <rol> wil ik <doel>, zodat <waarde>.
5. Onduidelijkheden en afhankelijkheden: benoem open functionele vragen, technische afhankelijkheden en externe keuzes; als er geen zijn, zet expliciet dat er geen bekende afhankelijkheden zijn.
6. Relevante achtergrond informatie: voeg alleen toe als tijdens het gesprek relevante code, documentatie, design of context naar voren komt.
7. Acceptatiecriteria: gebruik 1-10 compacte, toetsbare criteria, bij voorkeur 3-7.
8. Kwaliteit en borging: neem altijd teststrategie (unit/integratie/e2e waar relevant) en documentatie-update (Confluence en/of technische docs) op.

## Afronding

Na de definitieve versie voeg je altijd toe:

1. "Originele initiële prompt van aanvrager".
2. Neem daaronder de oorspronkelijke, ongewijzigde aanvraagtekst op die de gebruiker gaf voor description en acceptatiecriteria.
3. Sluit af met: "Klopt dit zo?"
4. Alleen bij expliciete "ja": maak het ticket direct aan via `jira-ticket-create`.

## Stopconditie

Rond pas af wanneer:

1. Maximaal 3 impactvragen zijn gesteld of aantoonbaar niet nodig.
2. Een compacte ticketversie is opgeleverd.
3. Plan-validatie met code is gedaan inclusief mismatch-check.
4. Originele initiële prompt is opgenomen.
5. De gebruiker heeft bevestigd dat het concept klopt.
