---
name: jira-ticket-create
description: 'Maak een Jira ticket aan.'
argument-hint: 'Project key, issue type en tickettekst'
---

# Jira Ticket Create

## Doel

Maak een Jira ticket direct aan wanneer de gebruiker dat expliciet wil.

## Wanneer gebruiken

1. Alleen gebruiken na een afgeronde output uit de skill `jira-ticket-grill`.
2. Alleen starten als de gebruiker expliciet "ja" zegt op directe Jira-aanmaak.

## Hand-off contract

Verwacht exact dit JSON formaat (single source of truth voor alle velden):

```json
{
  "projectKey": "MIJN",
  "issueTypeName": "Story",
  "parentIssueKey": "MIJN-124",
  "summary": "Korte titel",
  "description": "# 1. Huidige situatie\n...",
  "acceptanceCriteria": "1. ...",
  "comment": "## Originele initiële prompt van aanvrager\n\n<ongewijzigde prompttekst>"
}
```

1. Verplicht: `projectKey`, `issueTypeName`, `summary`, `description`, `acceptanceCriteria`, `comment`.
2. Optioneel: `parentIssueKey`.
3. `issueTypeName` moet exact `Story`, `Bug` of `Spike` zijn.
4. `description` en `acceptanceCriteria` zijn markdown velden.
5. `acceptanceCriteria` gaat naar een apart Jira-veld, niet in `description`.
6. `parentIssueKey` is informatief; het script forceert parent naar `MIJN-124`.
7. `comment` bevat altijd de originele initiële prompt van de aanvrager als markdown comment.
8. Als `JIRA_ACCEPTANCE_CRITERIA_FIELD_ID` ontbreekt, probeert het script auto-detectie op veldnaam (`Acceptance criteria` / `Acceptatiecriteria`).

## Werkwijze

1. Controleer of de gebruiker expliciet directe aanmaak wil.
2. Controleer of alle verplichte velden aanwezig zijn.
3. Vraag ontbrekende velden een voor een uit.
4. Gebruik altijd het JSON formaat uit `Hand-off contract`; Geef de definitieve payload direct via stdin door aan het script:
5. `cat <<'JSON' | node --experimental-strip-types scripts/create-jira-ticket.ts --env .env.jira`
6. `<payload volgens Hand-off contract>`
7. Parse `issueKey` en `issueUrl` uit de script-output.
8. Open direct de VS Code Jira extensie met `atlascode.jira.showIssueForKey <issueKey>`.
9. Bevestig `issueKey` en `issueUrl` aan de gebruiker.

## Outputregels

1. Schrijf altijd in het Nederlands.
2. Gebruik alleen genummerde lijsten.
3. Lever eerst het JSON object op volgens `Hand-off contract`.
4. `comment` is verplicht en bevat de originele initiële prompt van de aanvrager.
5. Maak geen tmp-bestanden aan voor payload of output.
6. Na aanmaak: toon `issueKey` en `issueUrl` en open direct de Jira extensie op het nieuwe ticket.

## Stopconditie

1. JSON payload is compleet en valide.
2. Script is uitgevoerd.
3. Ticket is aangemaakt, `issueKey`/`issueUrl` zijn gedeeld, en de Jira extensie is geopend via `atlascode.jira.showIssueForKey`.
