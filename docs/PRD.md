# Product Requirements Document

## Vision
Eine Web-App, mit der Nutzer ihre Blutdruckmessungen dauerhaft erfassen und verfolgen können. Sie ersetzt mühsame Papier- oder Excel-Protokolle und ermöglicht es Patienten, ihrem Arzt einen übersichtlichen Verlauf vorzulegen.

## Target Users
Patienten mit Bluthochdruck oder anderen Herz-Kreislauf-Erkrankungen, die regelmäßig messen müssen.

**Pain Points:**
- Papierprotokoll ist unübersichtlich und geht verloren
- Excel ist umständlich auf dem Handy
- Werte lassen sich nicht einfach für den Arzt aufbereiten

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | User Authentication (Registrierung, Login, Logout) | Roadmap |
| P0 (MVP) | Messung erfassen (Eingabe, Bearbeiten, Löschen) | Roadmap |
| P0 (MVP) | Messliste mit Ampel-Hervorhebung | Roadmap |
| P1 | Verlaufsdiagramm (Liniendiagramm) | Roadmap |
| P1 | PDF-Export | Roadmap |

## Success Metrics
- Nutzer erfassen mindestens 3 Messungen pro Woche
- PDF-Export wird mindestens einmal pro Monat genutzt
- 7-Tage-Retention > 50%

## Constraints
- Solo-Projekt, kein fester Abgabetermin
- Backend: Supabase (PostgreSQL + Auth)
- Design: Tailwind + shadcn/ui Defaults, ruhiges medizinisches Farbschema (helles Layout, blaue Primärfarbe)

## Non-Goals
- Native Mobile App (nur Web)
- Push- oder E-Mail-Benachrichtigungen
- Arzt-Accounts oder direkte Datenweitergabe an Arzt
- Bluetooth-Integration mit Blutdruckgeräten
