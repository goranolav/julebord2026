# Jeopardy (julebord2026)

Et lokalt Jeopardy-spill bygget med React, TypeScript og Vite.

Appen lar deg:
- Lage og redigere egne sporsmalsbrett
- Starte spill med flere lag
- Holde styr pa tur, poeng og nedtelling per sporsmal
- Importere og eksportere brett som JSON
- Fortsette pagaende spill etter refresh (lagres lokalt i nettleseren)

## Teknologistack

- React 19
- TypeScript
- Vite
- Material UI (MUI)
- Vitest + Testing Library
- ESLint

## Kom i gang

Krav:
- Node.js (anbefalt LTS)

Installer avhengigheter:

```bash
npm install
```

Start utviklingsserver:

```bash
npm run dev
```

Standard URL i utvikling er vanligvis:

```text
http://localhost:5173/
```

## NPM-scripts

- `npm run dev`: Starter Vite dev-server
- `npm run build`: Typecheck + produksjonsbuild
- `npm run preview`: Forhandsviser produksjonsbuild lokalt
- `npm run lint`: Kjorer ESLint
- `npm run test`: Kjorer tester en gang
- `npm run test:watch`: Kjorer tester i watch mode

## Bruk i appen

### 1) Hjem

- Velg et gyldig brett og trykk Spill
- Ga til Admin-panel for a opprette eller redigere brett
- Hvis et spill allerede pagar, kan du fortsette det

### 2) Admin-panel

- Opprett nytt brett
- Rediger eksisterende brett
- Dupliser eller slett brett
- Eksporter ett eller alle brett til JSON
- Importer brett fra JSON

### 3) Spillside

- Velg sporsmal i brettet
- Marker svar som riktig/feil
- Vis fasit ved behov
- Juster poeng manuelt pa poengtavlen
- Avslutt spill og ga til resultat

## Data og lagring

Prosjektet bruker `localStorage` i nettleseren.

Nokler:
- `jeopardy.boards.v1`: Lagrer alle brett
- `jeopardy.game.v1`: Lagrer pagaende spill

Forste gang appen startes seedes et eksempelbrett automatisk.

## Import/eksport-format

Ved eksport skrives JSON i formatet:

```json
{
	"version": 1,
	"boards": []
}
```

Import stotter:
- Et objekt med `boards`-array
- Et rent array av brett
- Ett enkelt brett-objekt

Ved import far brett nye interne ID-er for a unnga kollisjoner.

## Sprak

Alle bruker-tekster ligger pa norsk bokmal i `src/i18n/no.ts`.

## Testing

Kjor alle tester:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## Vanlige problemer

- Port i bruk: Start Vite pa en annen port, f.eks. `npm run dev -- --port 5174`
- Endringer forsvinner: Sjekk at nettleseren tillater `localStorage`
- Push til GitHub feiler: Kontroller at `origin` peker til riktig repo og at du har tilgang

## Deployment til GitHub Pages

Prosjektet har en ferdig GitHub Actions-pipeline som deployer automatisk ved push til `main`.

Forstegangsoppsett i GitHub:
- Gaa til repo -> Settings -> Pages
- Under Build and deployment, velg Source: GitHub Actions
- Push endringer til `main` (eller kjør workflow manuelt fra Actions)

Pipeline:
- Installerer avhengigheter med `npm ci`
- Bygger appen med `npm run build`
- Publiserer `dist` til GitHub Pages

For dette repoet blir URL-en normalt:

```text
https://goranolav.github.io/julebord2026/
```

## Lisens

Ingen lisens er definert enda. Legg til en `LICENSE`-fil dersom prosjektet skal deles offentlig.