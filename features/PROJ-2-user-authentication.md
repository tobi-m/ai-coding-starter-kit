# PROJ-2: User Authentication

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## Implementation Notes
_To be added by /frontend and/or /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
