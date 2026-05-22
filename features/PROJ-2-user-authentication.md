# PROJ-2: User Authentication

## Status: In Review
**Created:** 2026-05-22
**Last Updated:** 2026-05-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Supabase Auth und der typisierte Client sind Voraussetzung

## User Stories
- Als Patient möchte ich mich mit E-Mail und Passwort registrieren, damit meine Messungen sicher meinem Konto zugeordnet werden.
- Als registrierter Nutzer möchte ich mich einloggen, damit ich auf meine gespeicherten Messungen zugreifen kann.
- Als eingeloggter Nutzer möchte ich mich ausloggen, damit andere Personen am selben Gerät keinen Zugriff auf meine Daten haben.
- Als Nutzer, der sein Passwort vergessen hat, möchte ich einen Reset-Link per E-Mail anfordern, damit ich wieder Zugang zu meinem Konto bekomme.
- Als nicht eingeloggter Nutzer, der eine geschützte Seite aufruft, möchte ich automatisch zum Login weitergeleitet werden, damit ich nicht auf eine Fehlerseite stoße.

## Out of Scope
- Account-Löschen — Konto-Löschung inkl. Datenlöschung ist eigene UX-Komplexität; für MVP nicht nötig
- OAuth / Social Login (Google, Apple) — kein Mehrwert für die Zielgruppe, erhöht Komplexität
- Magic Links — E-Mail + Passwort ist für die Zielgruppe vertrauter
- Nutzerprofil (Name, Avatar, etc.) — App ist persönliches Protokoll-Tool, kein soziales Netzwerk
- Forced Session Timeout / "Eingeloggt bleiben"-Checkbox — Session ist dauerhaft, kein manuelles Steuern
- Multi-Device Session Management — Einzelgerät-Nutzung ist der Normalfall
- Admin-Accounts oder Arzt-Accounts — explizit außerhalb des Produktscopes (siehe PRD)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Registrierung
- [ ] Angenommen der Nutzer ist auf `/register`, wenn er eine gültige E-Mail und ein Passwort mit mindestens 8 Zeichen eingibt und abschickt, dann wird eine Bestätigungsmail gesendet und er sieht eine Info-Meldung „Bitte bestätige deine E-Mail-Adresse — wir haben dir einen Link geschickt."
- [ ] Angenommen der Nutzer versucht sich zu registrieren, wenn er eine E-Mail eingibt, die bereits registriert ist, dann wird eine Fehlermeldung angezeigt „Diese E-Mail-Adresse ist bereits registriert."
- [ ] Angenommen der Nutzer füllt das Registrierungsformular aus, wenn er ein Passwort mit weniger als 8 Zeichen eingibt, dann wird eine Validierungsfehlermeldung angezeigt bevor das Formular abgeschickt wird.
- [ ] Angenommen der Nutzer ist bereits eingeloggt, wenn er `/register` aufruft, dann wird er direkt zu `/` weitergeleitet.

### E-Mail-Verifizierung
- [ ] Angenommen der Nutzer hat die Bestätigungsmail erhalten, wenn er auf den Bestätigungslink klickt, dann wird sein Account verifiziert und er wird eingeloggt zu `/` weitergeleitet.
- [ ] Angenommen der Bestätigungslink ist abgelaufen, wenn der Nutzer ihn aufruft, dann sieht er eine Fehlermeldung mit einem „Neuen Link anfordern"-Button.
- [ ] Angenommen der Nutzer hat sich registriert aber noch nicht verifiziert, wenn er versucht sich einzuloggen, dann sieht er eine Info-Meldung „Bitte bestätige zuerst deine E-Mail-Adresse" statt eines allgemeinen Fehlers.

### Login
- [ ] Angenommen der Nutzer ist auf `/login`, wenn er E-Mail und Passwort korrekt eingibt und abschickt, dann wird er zu `/` weitergeleitet.
- [ ] Angenommen der Nutzer gibt falsche Zugangsdaten ein, wenn er das Formular abschickt, dann sieht er eine generische Fehlermeldung „E-Mail oder Passwort ist falsch." (keine Unterscheidung, welches Feld falsch ist).
- [ ] Angenommen der Nutzer ist bereits eingeloggt, wenn er `/login` aufruft, dann wird er direkt zu `/` weitergeleitet.
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er eine geschützte Seite (z.B. `/`) aufruft, dann wird er zu `/login` weitergeleitet.

### Logout
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er auf „Abmelden" klickt, dann wird die Session beendet und er wird zu `/login` weitergeleitet.

### Passwort-Reset
- [ ] Angenommen der Nutzer ist auf der „Passwort vergessen"-Seite, wenn er eine registrierte E-Mail-Adresse eingibt, dann erhält er eine E-Mail mit einem Reset-Link und sieht die Meldung „Wenn ein Konto mit dieser E-Mail existiert, haben wir dir einen Link geschickt."
- [ ] Angenommen der Nutzer gibt eine nicht registrierte E-Mail ein, wenn er das Formular abschickt, dann sieht er dieselbe neutrale Meldung (kein Hinweis, ob die E-Mail existiert oder nicht).
- [ ] Angenommen der Nutzer hat den Reset-Link geöffnet, wenn er ein neues Passwort mit mindestens 8 Zeichen setzt, dann wird das Passwort geändert und er wird zu `/login` weitergeleitet.
- [ ] Angenommen der Reset-Link ist abgelaufen, wenn der Nutzer ihn aufruft, dann sieht er eine Fehlermeldung mit einem „Neuen Link anfordern"-Button.

## Edge Cases
- **Generische Fehlerformulierung bei Login** — „E-Mail oder Passwort ist falsch" verhindert, dass Angreifer herausfinden können, ob eine E-Mail registriert ist (User Enumeration).
- **Neutrale Meldung beim Passwort-Reset** — gleiche Meldung unabhängig davon, ob die E-Mail existiert (ebenfalls gegen User Enumeration).
- **Abgelaufene Links** — Supabase setzt TTL auf Bestätigungs- und Reset-Links; Nutzer braucht eine klare Option, einen neuen Link anzufordern.
- **Bereits eingeloggte Nutzer auf Auth-Seiten** — `/login` und `/register` leiten sofort zu `/` weiter statt eine leere Auth-Seite anzuzeigen.
- **Nicht verifizierter Nutzer beim Login** — spezifische Meldung statt generischer Fehler, damit der Nutzer weiß, er soll die Inbox prüfen.
- **Passwort-Reset-Link in neuem Tab geöffnet** — Session-Kontext fehlt möglicherweise; Supabase handhabt das über URL-Parameter (token_hash + type).
- **Netzwerkfehler beim Formularabschicken** — Fehlermeldung anzeigen, Formulareingaben erhalten, kein stilles Fehlschlagen.

## Technical Requirements
<!-- Intentionally left for /architecture — no implementation decisions here -->
- Supabase Auth (E-Mail + Passwort) als Auth-Provider
- Passwort-Mindestlänge: 8 Zeichen (in Supabase konfigurierbar)
- E-Mail-Verifizierung: aktiviert
- Session: Cookie-basiert (dauerhaft), gesteuert über `@supabase/ssr`
- Seiten: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Route Protection: Middleware oder Server-Component-Check — nicht eingeloggte Nutzer werden zu `/login` umgeleitet

## Open Questions
<!-- Unresolved questions from the spec interview. Close them in /refine when answered. -->
- [ ] Soll es einen direkten Link von `/login` zu `/register` geben und umgekehrt? (Empfehlung: ja — Standard-UX-Pattern, aber noch nicht explizit besprochen)
- [ ] Welche E-Mail-Absenderadresse und welcher Betreff für Bestätigungs- und Reset-Mails? (Kann in Supabase Auth Email Templates konfiguriert werden — für MVP Supabase-Default ausreichend)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| E-Mail + Passwort als einzige Auth-Methode | Vertrauteste Methode für Zielgruppe (Patienten, nicht zwingend tech-affin); OAuth erhöht Komplexität ohne klaren Mehrwert | 2026-05-22 |
| E-Mail-Verifizierung erforderlich | Gesundheitsdaten erfordern gesicherte E-Mail; schützt auch die Passwort-Reset-Funktion | 2026-05-22 |
| Passwort-Reset per E-Mail-Link | Standard-Pattern, sicher, keine Alternative nötig | 2026-05-22 |
| Getrennte Seiten für Login und Register | Nutzer registrieren sich einmal — danach nur noch Login; getrennte Seiten sind klarer | 2026-05-22 |
| Session dauerhaft (persistent) | Patienten nutzen die App täglich auf demselben Gerät; erzwungener Re-Login ist Hürde | 2026-05-22 |
| Nur E-Mail + Passwort im Registrierungsformular | App ist persönliches Protokoll-Tool, kein Nutzerprofil nötig | 2026-05-22 |
| Passwort-Mindestlänge 8 Zeichen | Sicherheit für Gesundheitsdaten; keine Komplexitätsregeln, die ältere Nutzer frustrieren | 2026-05-22 |
| Account-Löschen außerhalb MVP | Eigene UX-Komplexität (Bestätigungsdialog, Datenlöschung); nicht kritisch für MVP | 2026-05-22 |
| Generische Fehlermeldung bei Login | Verhindert User Enumeration — Angreifer darf nicht wissen, ob eine E-Mail registriert ist | 2026-05-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Middleware für Route-Schutz | Ein zentraler Ort statt Checks auf jeder einzelnen Seite — gilt automatisch für alle neuen Seiten | 2026-05-22 |
| Client Components für Formulare | Auth-Aufrufe (Login, Registrierung, Reset) funktionieren im Browser mit dem vorhandenen Browser-Client aus PROJ-1; keine Server Actions nötig | 2026-05-22 |
| Server Route Handler für `/auth/callback` | Supabase-E-Mail-Links enthalten einmalige Token — müssen serverseitig gegen eine Session getauscht werden | 2026-05-22 |
| Route-Gruppe `(auth)/` statt `/auth/` | Gruppiert Auth-Seiten im Dateisystem ohne `/auth/`-Prefix in der URL | 2026-05-22 |
| Keine neuen Pakete | `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers` bereits in PROJ-1 installiert | 2026-05-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Was gebaut wird

```
Projekt-Root
+-- middleware.ts              ← Zentraler Session-Check + Route-Schutz

src/app/
+-- (auth)/                   ← Route-Gruppe (kein URL-Segment)
|   +-- login/page.tsx
|   +-- register/page.tsx
|   +-- forgot-password/page.tsx
|   +-- reset-password/page.tsx
+-- auth/
|   +-- callback/route.ts     ← Server-Handler für E-Mail-Links (Verifizierung + Reset)
+-- layout.tsx                ← bestehend, kein Login-UI
+-- page.tsx                  ← geschützt (Messliste, kommt in PROJ-4)

src/components/
+-- auth/
    +-- LoginForm.tsx
    +-- RegisterForm.tsx
    +-- ForgotPasswordForm.tsx
    +-- ResetPasswordForm.tsx
```

### Seitenstruktur

```
/login
+-- LoginForm
    +-- E-Mail-Feld
    +-- Passwort-Feld
    +-- Abschicken-Button
    +-- Fehlermeldung (generisch: "E-Mail oder Passwort ist falsch")
    +-- Link → /forgot-password ("Passwort vergessen?")
    +-- Link → /register ("Noch kein Konto?")

/register
+-- RegisterForm
    +-- E-Mail-Feld
    +-- Passwort-Feld (min. 8 Zeichen, Client-Validierung via Zod)
    +-- Abschicken-Button
    +-- Erfolgsmeldung nach Registrierung (kein Redirect — Nutzer muss E-Mail bestätigen)
    +-- Link → /login ("Bereits registriert?")

/forgot-password
+-- ForgotPasswordForm
    +-- E-Mail-Feld
    +-- Abschicken-Button
    +-- Bestätigungsmeldung (neutral — immer gleich, unabhängig ob E-Mail bekannt)
    +-- Link → /login ("Zurück zum Login")

/reset-password
+-- ResetPasswordForm
    +-- Neues-Passwort-Feld (min. 8 Zeichen)
    +-- Abschicken-Button
    +-- Fehlermeldung bei abgelaufenem Link + "Neuen Link anfordern"-Button
    +-- Redirect zu /login nach Erfolg

/auth/callback  (kein UI — unsichtbarer Server-Handler)
+-- Liest Token aus URL-Parametern
+-- Tauscht Token gegen Session (serverseitig)
+-- Weiterleitung zu / (Erfolg) oder /login?error=... (Fehler)
```

### Route-Schutz via Middleware

```
Eingehende Anfrage
       ↓
Öffentliche Route? (/login, /register, /forgot-password, /reset-password, /auth/callback)
    ↓ ja                            ↓ nein (geschützt)
Nutzer eingeloggt?              Nutzer eingeloggt?
  ↓ ja      ↓ nein               ↓ ja        ↓ nein
Redirect /  Seite zeigen       Seite zeigen  Redirect /login
```

### Datenmodell

Keine neuen Datenbanktabellen. Supabase Auth verwaltet Nutzer intern in `auth.users`. Die `measurements`-Tabelle hat bereits den Foreign Key auf `auth.users(id)` (eingerichtet in PROJ-1).

### Neue Pakete

Keine — `@supabase/ssr`, `react-hook-form`, `zod` und `@hookform/resolvers` sind bereits installiert.

## Implementation Notes

**Implementiert am:** 2026-05-22

### Was gebaut wurde
- `middleware.ts` — zentraler Session-Check; schützt alle Routen außer Auth-Seiten; leitet eingeloggte Nutzer von Auth-Seiten weg (außer `/reset-password` wegen Recovery-Session)
- `src/app/auth/callback/route.ts` — Server Route Handler; tauscht Supabase-Code gegen Session; liest optionalen `next`-Parameter für Passwort-Reset-Redirect
- `src/app/(auth)/login/page.tsx` — Login-Seite mit URL-Fehleranzeige (z.B. abgelaufener Verification-Link)
- `src/app/(auth)/register/page.tsx` — Registrierungs-Seite
- `src/app/(auth)/forgot-password/page.tsx` — Passwort-vergessen-Seite
- `src/app/(auth)/reset-password/page.tsx` — Neues-Passwort-setzen-Seite
- `src/components/auth/LoginForm.tsx` — react-hook-form + Zod; unterscheidet unverifizierten Nutzer von falschem Passwort
- `src/components/auth/RegisterForm.tsx` — zeigt Erfolgs-Alert statt Redirect (Nutzer muss E-Mail bestätigen)
- `src/components/auth/ForgotPasswordForm.tsx` — immer neutrale Meldung (kein User-Enumeration-Leak)
- `src/components/auth/ResetPasswordForm.tsx` — ruft `updateUser()` mit Recovery-Session auf
- `src/components/auth/LogoutButton.tsx` — Client Component; ruft `signOut()` auf, redirectet zu `/login`
- `src/app/page.tsx` — Placeholder für PROJ-4 (Messliste)
- `src/app/globals.css` — Primärfarbe auf Blau gesetzt (HSL 217 89% 54%)
- `src/app/layout.tsx` — `lang="de"`, App-Metadata aktualisiert

### Abweichungen vom Tech Design
- Keine: Alle Seiten und Komponenten entsprechen der Spec und dem Architektur-Design exakt

## QA Test Results

### Re-QA — 2026-05-22 (aktueller Stand)

**Tester:** /qa skill
**Entscheidung: NICHT PRODUKTIONSREIF — 4 Medium Bugs offen**

**Gefixter Bug seit letztem QA-Lauf:**
- ~~BUG-1 (High)~~ — **BEHOBEN:** `middleware.ts` nach `src/middleware.ts` verschoben + try/catch ergänzt; Route Protection funktioniert jetzt korrekt (curl + E2E bestätigt)

#### Acceptance Criteria

| # | Kriterium | Ergebnis | Notiz |
|---|-----------|----------|-------|
| R1 | Erfolgreiche Registrierung → Bestätigungsmail | NICHT TESTBAR | Erfordert echte E-Mail |
| R2 | Doppelte E-Mail → Fehlermeldung | FAIL | BUG-3 — Supabase-identities-Check fehlt |
| R3 | Passwort < 8 Zeichen → Validierungsfehler | FAIL | BUG-2 — `noValidate` fehlt |
| R4 | Bereits eingeloggt auf `/register` → Redirect `/` | NICHT TESTBAR | Erfordert eingeloggten Zustand |
| V1 | Bestätigungslink → eingeloggt + Redirect `/` | NICHT TESTBAR | Erfordert echte E-Mail |
| V2 | Abgelaufener Bestätigungslink → Fehler + "Neuen Link" | NICHT TESTBAR | Erfordert E-Mail |
| V3 | Nicht verifizierter Nutzer beim Login → spezifische Meldung | NICHT TESTBAR | Erfordert unverifiziertes Konto |
| L1 | Korrekte Zugangsdaten → Redirect `/` | NICHT TESTBAR | Erfordert echtes Konto |
| L2 | Falsche Zugangsdaten → generische Fehlermeldung | PASS | E2E-Test bestätigt |
| L3 | Bereits eingeloggt auf `/login` → Redirect `/` | NICHT TESTBAR | Erfordert eingeloggten Zustand |
| L4 | Nicht eingeloggt auf geschützter Seite → Redirect `/login` | PASS | curl: HTTP 307 → `/login`; E2E bestätigt (BUG-1 behoben) |
| O1 | Logout → Session beendet + Redirect `/login` | NICHT TESTBAR | Erfordert eingeloggten Zustand |
| P1 | Bekannte E-Mail → neutrale Bestätigung | PASS | E2E-Test bestätigt |
| P2 | Unbekannte E-Mail → gleiche neutrale Meldung | PASS | E2E-Test bestätigt |
| P3 | Reset-Link → neues Passwort → Redirect `/login` | NICHT TESTBAR | Erfordert E-Mail |
| P4 | Abgelaufener Reset-Link → Fehler + "Neuen Link" | NICHT TESTBAR | Erfordert E-Mail |

**Ergebnis: 4 Pass / 2 Fail / 10 nicht testbar (E-Mail-Flows)**

#### Offene Bugs

##### BUG-2 — Medium: Fehlendes `noValidate` — nativer Validator überschreibt Zod
**Dateien:** `LoginForm.tsx:61`, `RegisterForm.tsx:79`, `ForgotPasswordForm.tsx:56`, `ResetPasswordForm.tsx:51`
**Schritte:**
1. `/login` aufrufen
2. In E-Mail-Feld `notanemail` eingeben, Passwort beliebig
3. Submit klicken
4. Erwartet: "Bitte gib eine gültige E-Mail-Adresse ein" (Zod-Fehlermeldung)
5. Erhalten: Browser-nativer Validierungstooltip statt custom Text
**Bestätigt:** Chromium + Mobile Safari E2E-Tests
**Fix:** `noValidate` zum `<form>`-Element in allen vier Form-Komponenten hinzufügen

##### BUG-3 — Medium: RegisterForm erkennt doppelte E-Mail nicht
**Datei:** `RegisterForm.tsx:44–54`
**Problem:** Supabase gibt bei `signUp()` mit bereits registrierter E-Mail `{ error: null, data: { user: { identities: [] } } }` zurück. Der Error-Check auf `error.message` greift nie, da `error` null ist.
**Ergebnis:** Nutzer sieht "Bestätigungsmail gesendet!" statt "Diese E-Mail-Adresse ist bereits registriert"
**Fix:** Nach `signUp()` prüfen: `if (data.user?.identities?.length === 0) { setError('Diese E-Mail-Adresse ist bereits registriert.') }`
**Alternative:** Spec anpassen — neutrale Meldung akzeptieren (sicherer gegen User Enumeration, kein UI-Bug mehr)

##### BUG-4 — Medium: ForgotPasswordForm kein `catch`-Block
**Datei:** `ForgotPasswordForm.tsx:29–41`
**Problem:** Nur `try...finally` ohne `catch`. Bei Netzwerkfehler wird Loading-State zurückgesetzt, aber kein Feedback für den Nutzer — stilles Fehlschlagen.
**Fix:** `catch`-Block ergänzen mit `setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')`

##### BUG-6 — Medium: Vitest-Config lädt Playwright-Spec-Dateien (NEU)
**Datei:** `vitest.config.ts`
**Problem:** Kein `include`-Pattern definiert — Vitest findet alle `*.spec.ts`-Dateien inkl. `tests/PROJ-2-user-authentication.spec.ts`. Das führt zum Fehler "Playwright Test did not expect test() to be called here"; `npm test` endet mit Exit-Code 1.
**Impact:** CI schlägt fehl beim `npm test`-Schritt
**Fix:** `include: ['src/**/*.test.ts']` zur `test`-Konfiguration in `vitest.config.ts` hinzufügen

##### BUG-5 — Low: Potenzieller Open Redirect in `/auth/callback`
**Datei:** `src/app/auth/callback/route.ts:8`
**Problem:** `next`-Parameter kommt direkt aus der URL und wird ohne Validierung in `${origin}${next}` eingebaut. `${origin}` begrenzt echte Open Redirects, aber `next=//evil.com` könnte in manchen Interpretationen problematisch sein.
**Fix:** `const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'`

#### Security Audit

| Prüfung | Ergebnis |
|---------|----------|
| Route Protection | PASS — Middleware schützt korrekt (BUG-1 behoben) |
| User Enumeration beim Login | PASS — generische Fehlermeldung |
| User Enumeration beim Passwort-Reset | PASS — neutrale Meldung immer gleich |
| XSS in Fehlermeldungen | PASS — React-Rendering, kein dangerouslySetInnerHTML |
| Credentials im Browser-Speicher | PASS — Supabase JWT in httpOnly-Cookies |
| Open Redirect | LOW RISK — BUG-5 dokumentiert |
| CSRF | PASS — Supabase PKCE-Flow + Cookie-basiert |

#### Automatisierte Tests

**Unit-Tests:** `src/components/auth/auth-schemas.test.ts` — 14 Tests bestanden; `src/lib/supabase.test.ts` — 5 Tests bestanden (PROJ-1, kein Regression)
**`npm test` Exit-Code:** 1 (wegen BUG-6 — Playwright-Spec von Vitest aufgelesen)

**E2E-Tests:** `tests/PROJ-2-user-authentication.spec.ts` — **32 bestanden, 2 gescheitert** (chromium + Mobile Safari)
- FAIL: `login form shows validation error for invalid email` → BUG-2
- ~~FAIL: `unauthenticated user visiting / is redirected to /login`~~ → BEHOBEN (BUG-1)

**Nicht per E2E testbar (erfordern echte E-Mail):**
- E-Mail-Verifizierungsflow
- Passwort-Reset-Flow
- Bereits-eingeloggt-Redirects

---

### Erster QA-Lauf — 2026-05-22 (historisch)

**Entscheidung: NICHT PRODUKTIONSREIF — 1 High + 3 Medium Bugs**

**E2E-Tests:** 29 bestanden, 5 gescheitert
- FAIL: `unauthenticated user visiting / is redirected to /login` (chromium + Mobile Safari) → BUG-1
- FAIL: `login form shows validation error for invalid email` (chromium + Mobile Safari) → BUG-2
- FAIL: `login with wrong credentials shows generic error` (chromium) → transienter Supabase Rate Limit; im Re-QA nicht mehr reproduzierbar

**Bugs aus erstem QA-Lauf:**
- BUG-1 (High): Middleware Route Protection → **BEHOBEN**
- BUG-2 (Medium): `noValidate` fehlt → offen
- BUG-3 (Medium): RegisterForm doppelte E-Mail → offen
- BUG-4 (Medium): ForgotPasswordForm kein catch → offen
- BUG-5 (Low): Open Redirect in callback → offen

## Deployment
_To be added by /deploy_
