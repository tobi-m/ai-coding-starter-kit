# PROJ-1: Supabase Infrastructure Setup

## Status: Approved
**Created:** 2026-05-21
**Last Updated:** 2026-05-22 (MCP-basierte Schema-Migration hinzugefügt)

## Dependencies
- None

## User Stories
- As a developer, I want a Supabase project connected to the app so that all other features can read and write data.
- As a developer, I want the `measurements` table created with the correct schema so that blood pressure data can be stored persistently.
- As a developer, I want Row Level Security enabled so that each user can only access their own measurements.
- As a developer, I want a typed Supabase client available in the codebase so that all features have type-safe database access.
- As a developer, I want environment variables documented so that the project can be set up from scratch without guessing.

## Out of Scope
- Local Supabase Docker instance — we connect directly to hosted Supabase (solo project, no team isolation needed)
- `profiles` table — Supabase Auth's built-in `auth.users` is sufficient for MVP; deferred if user profile features are added later
- Supabase Storage setup — may be needed for PROJ-6 (PDF-Export), deferred to that feature
- Staging / preview environments — single hosted Supabase project is sufficient

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen die `.env.local`-Datei fehlt oder enthält keine Supabase-URL, wenn die App gestartet wird, dann wird ein klarer Fehler geworfen, der auf die fehlende Konfiguration hinweist.
- [ ] Angenommen die Supabase-Umgebungsvariablen sind korrekt gesetzt, wenn der Supabase-Client importiert wird, dann ist eine typisierte Instanz ohne zusätzliche Konfiguration nutzbar.
- [ ] Angenommen die `measurements`-Tabelle wurde angelegt, wenn ein neuer Datensatz eingefügt wird, dann werden alle Pflichtfelder (`systolic`, `diastolic`, `pulse`, `measured_at`, `user_id`) validiert und gespeichert.
- [ ] Angenommen Row Level Security ist aktiviert, wenn ein eingeloggter Nutzer die `measurements`-Tabelle abfragt, dann sieht er ausschließlich seine eigenen Einträge.
- [ ] Angenommen Row Level Security ist aktiviert, wenn ein nicht eingeloggter Request auf die `measurements`-Tabelle trifft, dann wird der Zugriff verweigert.
- [ ] Angenommen das Supabase-Projekt ist verbunden, wenn TypeScript-Typen aus dem Schema generiert werden, dann stimmen die Typen mit der tatsächlichen Tabellenstruktur überein.
- [ ] Angenommen der Supabase MCP Server ist konfiguriert, wenn die Migration ausgeführt wird, dann wird die `measurements`-Tabelle mit allen Pflichtfeldern, RLS-Aktivierung und den vier Policies (SELECT, INSERT, UPDATE, DELETE) automatisiert im Supabase-Projekt angelegt.

## Edge Cases
- Fehlende oder falsche Env-Variablen: App sollte nicht lautlos fehlschlagen — expliziter Startup-Fehler erforderlich.
- RLS versehentlich deaktiviert: Ohne RLS können Nutzer gegenseitig auf Messungen zugreifen — muss im QA geprüft werden.
- `notes`-Feld ist optional (nullable) — kein NOT NULL Constraint.
- `measured_at` speichert den Zeitpunkt der Messung (nicht `created_at`) — Nutzer kann Messungen auch rückwirkend eintragen.
- `user_id` muss als Foreign Key auf `auth.users(id)` verweisen, damit gelöschte Nutzer keine verwaisten Einträge hinterlassen (CASCADE DELETE).

## Technical Requirements
- Supabase-Projekt: hosted (kein lokales Docker)
- Datenbanktabelle: `measurements` mit den Spalten:
  - `id` uuid, primary key, default `gen_random_uuid()`
  - `user_id` uuid, not null, references `auth.users(id)` on delete cascade
  - `systolic` integer, not null
  - `diastolic` integer, not null
  - `pulse` integer, not null
  - `measured_at` timestamptz, not null
  - `notes` text, nullable
  - `created_at` timestamptz, not null, default `now()`
- RLS: aktiviert auf `measurements`; Policy: Nutzer darf nur eigene Zeilen lesen/schreiben/löschen
- TypeScript-Typen: generiert via Supabase CLI (`supabase gen types typescript`)
- Env-Variablen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase-Client: `src/lib/supabase.ts` exportiert einen typisierten Client

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [x] Soll `measured_at` vom Nutzer frei wählbar sein (rückwirkende Einträge erlaubt), oder immer automatisch auf `now()` gesetzt? — **Entschieden: nutzerseitig wählbar** (rückwirkende Eingabe erlaubt, da App Papier-/Excel-Protokoll ersetzt)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kein `profiles`-Table | Supabase Auth reicht für MVP; spart Komplexität | 2026-05-21 |
| Direkte Verbindung zu hosted Supabase (kein Docker) | Solo-Projekt, kein Team — lokale Isolation nicht nötig | 2026-05-21 |
| `measured_at` statt nur `created_at` | Nutzer soll Messungen auch rückwirkend erfassen können | 2026-05-21 |
| CASCADE DELETE auf `user_id` | Verhindert verwaiste Messungen wenn ein Nutzer gelöscht wird | 2026-05-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `@supabase/ssr` statt nur `@supabase/supabase-js` für den Client | App Router braucht Cookie-basiertes Session-Management für Server Components; frühzeitige Einführung vermeidet Refactoring bei PROJ-2 (Auth) | 2026-05-21 |
| Zwei Client-Instanzen (Browser + Server) | App Router erfordert getrennte Clients — Browser-Client für Client Components, Server-Client für Server Components und API Routes | 2026-05-21 |
| Auto-generierte TypeScript-Typen via Supabase CLI | Schema-Änderungen werden sofort als TypeScript-Fehler sichtbar; verhindert stille Typ-Abweichungen zur Laufzeit | 2026-05-21 |
| `.env.example` eingecheckt | Dokumentiert welche Env-Variablen benötigt werden, ohne echte Credentials preiszugeben | 2026-05-21 |
| Schema-Anlage via Supabase MCP statt Dashboard | MCP Server ist konfiguriert — automatisierte Migration ist zuverlässiger und reproduzierbarer als manuelle Dashboard-Klicks | 2026-05-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Was gebaut wird

Reine Setup-Arbeit — kein UI, keine Seiten, keine API-Routen. Alles findet entweder im Supabase-Dashboard oder als Konfigurationsdateien im Codebase statt.

```
Supabase Dashboard (extern)
+-- Neues Projekt angelegt
+-- measurements-Tabelle
|   +-- Alle Spalten (id, user_id, systolic, diastolic, pulse, measured_at, notes, created_at)
+-- Row Level Security aktiviert
    +-- SELECT-Policy: nur eigene Zeilen
    +-- INSERT-Policy: nur eigene Zeilen
    +-- UPDATE-Policy: nur eigene Zeilen
    +-- DELETE-Policy: nur eigene Zeilen

Codebase (src/lib/)
+-- supabase.ts         ← auskommentierten Client aktivieren (Browser-Client)
+-- supabase-server.ts  ← Server-Client für Server Components und API Routes
+-- database.types.ts   ← auto-generierte TypeScript-Typen aus dem Schema

Projekt-Root
+-- .env.local          ← echte Credentials (git-ignoriert)
+-- .env.example        ← Vorlage zur Dokumentation (eingecheckt)
```

### Datenmodell

**`measurements`-Tabelle** — eine Zeile pro Blutdruckmessung:

| Spalte | Typ | Hinweis |
|--------|-----|---------|
| `id` | UUID | Auto-generiert, Primary Key |
| `user_id` | UUID | Verknüpft mit Supabase Auth User; CASCADE DELETE |
| `systolic` | Integer | Pflichtfeld |
| `diastolic` | Integer | Pflichtfeld |
| `pulse` | Integer | Pflichtfeld |
| `measured_at` | Timestamp (mit Zeitzone) | Vom Nutzer gesetzt — rückwirkende Eingabe erlaubt |
| `notes` | Text | Optional, nullable |
| `created_at` | Timestamp (mit Zeitzone) | Automatisch auf now() gesetzt beim Einfügen |

Gespeichert in: **Supabase PostgreSQL** (hosted, kein lokales Docker).

### Abhängigkeiten (neue Pakete)

| Paket | Zweck |
|-------|-------|
| `@supabase/ssr` | Cookie-basierter Auth-Client für Next.js App Router (Browser + Server) |
| `supabase` (CLI, dev) | TypeScript-Typen aus dem Live-Schema generieren |

`@supabase/supabase-js` ist bereits installiert — keine Änderung nötig.

## Implementation Notes

**Implementiert am:** 2026-05-22

### Was gebaut wurde
- `measurements`-Tabelle via Supabase MCP Migration angelegt (`create_measurements_table`)
- RLS aktiviert mit 4 Policies: SELECT, INSERT, UPDATE, DELETE (jeweils `auth.uid() = user_id`)
- Zwei Indizes: `idx_measurements_user_id` (einfach) und `idx_measurements_measured_at` (composite auf `user_id, measured_at DESC` für sortierte Listenabfragen)
- Browser-Client: `src/lib/supabase.ts` — exportiert `createClient()` mit Env-Var-Validierung
- Server-Client: `src/lib/supabase-server.ts` — Cookie-basiert für App Router Server Components
- TypeScript-Typen: `src/lib/database.types.ts` — manuell angelegt, stimmt mit tatsächlichem Schema überein

### Abweichungen vom Tech Design
- Keine: Schema und Clients entsprechen der Spec exakt

## QA Test Results

**QA Date:** 2026-05-22
**Tester:** /qa skill
**Decision: APPROVED — all bugs fixed, 7/7 AC pass**

### Acceptance Criteria

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| AC1 | Clear error on missing env vars at startup | PASS | Both browser and server clients throw clear error on missing env vars |
| AC2 | Typed Supabase client available on import | PASS | Both clients typed with `Database` generic |
| AC3 | measurements table with all required columns | PASS | All 8 columns, correct types, NOT NULL constraints, defaults verified in live DB |
| AC4 | RLS: logged-in user sees only own rows | PASS | 4 policies (SELECT/INSERT/UPDATE/DELETE) all scoped to `auth.uid() = user_id` |
| AC5 | RLS: unauthenticated access denied | PASS | RLS enabled, no public/anon policies — access denied by default |
| AC6 | TypeScript types match schema | PASS | `database.types.ts` matches live schema exactly |
| AC7 | MCP migration creates table with RLS + policies | PASS | Migration `create_measurements_table` applied, all 4 policies present |

**Result: 7/7 pass** _(BUG-1 fixed 2026-05-22)_

### Bugs Found

#### ~~BUG-1 — Medium: Server client has no env var validation~~ FIXED 2026-05-22
Added the same `if (!supabaseUrl || !supabaseAnonKey) throw new Error(...)` guard to `supabase-server.ts`, mirroring the browser client pattern.

#### BUG-2 — Low: `supabase/schema.sql` index out of sync with live DB
**File:** `supabase/schema.sql` line 35
**Problem:** File documents `idx_measurements_measured_at` as single-column `(measured_at DESC)`, but live DB has composite `(user_id, measured_at DESC)` (which is correct per implementation notes)
**Risk:** Developer running this SQL file directly would create a less efficient index; schema.sql is misleading as a reference
**Fix:** Update line 35 to `create index idx_measurements_measured_at on public.measurements(user_id, measured_at desc);`

### Security Audit

| Check | Result |
|-------|--------|
| RLS policies scoped correctly | PASS — `auth.uid() = user_id` on all 4 ops |
| No hardcoded credentials | PASS |
| FK CASCADE DELETE prevents orphaned data | PASS — `confdeltype = 'c'` confirmed in live DB |
| `notes` nullable, no data integrity issue | PASS |
| Env vars not committed | PASS — `.env.local` in `.gitignore` |
| Server client env var bypass | FAIL — captured as BUG-1 |

### Edge Cases Tested

| Edge Case | Result |
|-----------|--------|
| `notes` is optional/nullable | PASS — no NOT NULL in schema |
| `measured_at` has no default (user-controlled) | PASS — no default value on column |
| CASCADE DELETE configured on user_id FK | PASS — verified live via pg_constraint |
| Both browser and server clients exported | PASS |

### Automated Tests

**Unit tests:** `src/lib/supabase.test.ts` — 5 tests, all pass
- Missing URL → throws "Missing Supabase environment variables"
- Missing anon key → throws "Missing Supabase environment variables"
- Both missing → throws "Missing Supabase environment variables"
- Both set → `createClient` is exported and callable
- `createClient()` returns a client instance

**E2E tests:** Not applicable — pure infrastructure feature, no UI to test with Playwright

## Deployment
_To be added by /deploy_
