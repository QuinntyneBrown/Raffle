# Software Architecture Description

## Raffle Web Application

Conformant with ISO/IEC/IEEE 42010:2022 — Architecture Description of Systems

---

## 1. Architecture Description Identification

| Field | Value |
|---|---|
| **System Name** | Raffle Web Application |
| **Document Version** | 1.0 |
| **Date** | 2026-04-07 |
| **Status** | Baseline |
| **Governing Requirements** | docs/specs/L1.md, docs/specs/L2.md |
| **Standards Conformance** | ISO/IEC/IEEE 42010:2022 |

### 1.1 Purpose

This document describes the software architecture of the Raffle Web Application, a system that enables public name-drawing events managed through a secure back office. It identifies stakeholders, captures their concerns, defines architecture viewpoints, and presents architecture views that address those concerns. Architecture decisions and their rationale are recorded to support future evolution.

### 1.2 Scope

The architecture encompasses:

- A public-facing single-page application for raffle drawing with animated reveals.
- A back office single-page application for raffle administration.
- A backend API service providing business logic, data persistence, and authentication.
- The deployment infrastructure required to host and operate the system.

---

## 2. System of Interest

The Raffle Web Application is a responsive web-based system consisting of two user-facing applications — a public drawing page and an administrative back office — supported by a shared backend API and persistent data store.

The public page presents a minimal interface (heading, subheading, name display, draw button) with configurable animated name-cycling, celebratory effects, and synchronized sound. The back office enables authenticated administrators to create, configure, activate, and manage raffles with per-raffle theming and animation settings.

The system enforces that each name is drawn at most once per raffle, supports concurrent access, and meets WCAG 2.2 AA accessibility standards.

---

## 3. Stakeholders and Concerns

### 3.1 Stakeholder Identification

| ID | Stakeholder | Description |
|---|---|---|
| SH-1 | **Public Visitor** | End user who visits the public raffle page to draw a name. |
| SH-2 | **Administrator** | Authenticated user who creates, configures, and manages raffles via the back office. |
| SH-3 | **Development Team** | Engineers responsible for building and maintaining the system. |
| SH-4 | **Operations / DevOps** | Personnel responsible for deployment, monitoring, and infrastructure. |
| SH-5 | **Product Owner** | Decision-maker responsible for feature prioritization and acceptance. |
| SH-6 | **Security Auditor** | Evaluates the system for compliance with security best practices. |
| SH-7 | **Accessibility Auditor** | Evaluates WCAG 2.2 AA compliance and assistive technology support. |

### 3.2 Concern Catalog

| ID | Concern | Stakeholders | Governing Requirements |
|---|---|---|---|
| C-1 | The draw experience must be engaging, animated, and accompanied by sound. | SH-1, SH-5 | L1-001, L1-011, L2-001, L2-031, L2-032, L2-037 |
| C-2 | A name must never be drawn twice within the same raffle. | SH-1, SH-2, SH-5 | L1-002, L2-004, L2-028 |
| C-3 | Administrators must be able to fully manage raffles with per-raffle theming. | SH-2, SH-5 | L1-003, L2-006, L2-007, L2-034, L2-035, L2-036 |
| C-4 | Only one raffle may be active at a time. | SH-2, SH-5 | L1-004, L2-011, L2-012 |
| C-5 | The back office must be protected by authentication. | SH-2, SH-6 | L1-005, L2-013, L2-014, L2-015 |
| C-6 | Both apps must be fully responsive across xs to xl viewports. | SH-1, SH-2, SH-7 | L1-006, L2-016, L2-017 |
| C-7 | The system must resist OWASP Top 10 vulnerabilities. | SH-6, SH-4 | L1-007, L2-018, L2-019, L2-020, L2-021 |
| C-8 | The system must be accessible per WCAG 2.2 AA. | SH-1, SH-7 | L1-008, L2-022, L2-023, L2-024, L2-033 |
| C-9 | The codebase must be maintainable, testable, and well-structured. | SH-3, SH-5 | L1-009, L2-025, L2-026, L2-027 |
| C-10 | The system must be reliable under concurrent use and resilient to failure. | SH-1, SH-4 | L1-010, L2-028, L2-029, L2-030 |
| C-11 | The system must be deployable, observable, and operable. | SH-4, SH-3 | L1-010, L2-029 |

---

## 4. Architecture Viewpoints

This architecture description employs six viewpoints. Each viewpoint defines a perspective from which the system is examined, the concerns it addresses, and the model kinds used.

| Viewpoint | Addresses Concerns | Model Kinds |
|---|---|---|
| **Context** | C-1, C-3, C-5, C-11 | System context diagram, actor catalog |
| **Functional** | C-1, C-2, C-3, C-4, C-5 | Component diagram, responsibility table |
| **Information** | C-2, C-3, C-4, C-10 | Entity-relationship diagram, data dictionary |
| **Concurrency** | C-2, C-10 | Sequence diagram, concurrency strategy |
| **Deployment** | C-7, C-10, C-11 | Deployment diagram, infrastructure table |
| **Development** | C-9, C-6, C-8 | Package diagram, technology stack, module map |

---

## 5. Architecture Views

### 5.1 Context View

**Viewpoint:** Context
**Concerns addressed:** C-1, C-3, C-5, C-11

#### 5.1.1 System Context Diagram

```
                         ┌─────────────────────────────────────────────┐
                         │          Raffle Web Application             │
                         │                                             │
  ┌──────────┐   HTTPS   │  ┌─────────────┐      ┌─────────────────┐  │
  │  Public   │◄─────────┼─►│ Public SPA  │      │   Backend API   │  │
  │  Visitor  │           │  └──────┬──────┘      └────────┬────────┘  │
  └──────────┘           │         │    REST / JSON        │           │
                         │         └───────────────────────┤           │
  ┌──────────┐   HTTPS   │  ┌─────────────┐               │           │
  │  Admin   │◄─────────┼─►│BackOffice SPA│───────────────►│           │
  │  User    │           │  └─────────────┘                │           │
  └──────────┘           │                          ┌──────┴──────┐   │
                         │                          │  Database   │   │
                         │                          │ (PostgreSQL)│   │
                         │                          └─────────────┘   │
                         │                                             │
                         │  ┌─────────────┐                            │
                         │  │Static Assets│  (audio, theme CSS, fonts) │
                         │  │   (CDN)     │                            │
                         │  └─────────────┘                            │
                         └─────────────────────────────────────────────┘
```

#### 5.1.2 External Actors

| Actor | Type | Interaction |
|---|---|---|
| Public Visitor | Human | Accesses the public SPA via browser. Clicks "Draw" to trigger name selection. No authentication required. |
| Administrator | Human | Authenticates via the back office SPA. Creates/manages raffles, sets active raffle, configures themes and animations. |
| CDN | Infrastructure | Serves static assets (JS bundles, CSS, audio files, fonts) with caching and geographic distribution. |
| Database | Infrastructure | PostgreSQL instance providing durable storage for all raffle data, draw history, and user credentials. |

#### 5.1.3 System Boundary

The system boundary encompasses the two SPAs, the backend API, and the database. The CDN is considered an external infrastructure dependency. The browser and its Web Audio API are part of the user's environment, not the system.

---

### 5.2 Functional View

**Viewpoint:** Functional
**Concerns addressed:** C-1, C-2, C-3, C-4, C-5

#### 5.2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                               │
│                                                                     │
│  ┌───────────────────────────┐   ┌────────────────────────────────┐ │
│  │      Public SPA           │   │      Back Office SPA           │ │
│  │                           │   │                                │ │
│  │  ┌─────────────────────┐  │   │  ┌──────────────────────────┐ │ │
│  │  │   DrawPage          │  │   │  │  AuthModule              │ │ │
│  │  │   - HeadingDisplay  │  │   │  │  - LoginForm             │ │ │
│  │  │   - NameDisplay     │  │   │  │  - SessionManager        │ │ │
│  │  │   - DrawButton      │  │   │  └──────────────────────────┘ │ │
│  │  │   - MuteToggle      │  │   │  ┌──────────────────────────┐ │ │
│  │  └─────────────────────┘  │   │  │  RaffleManagement        │ │ │
│  │  ┌─────────────────────┐  │   │  │  - Dashboard             │ │ │
│  │  │   AnimationEngine   │  │   │  │  - CreateEditForm        │ │ │
│  │  │   - CyclingRenderer │  │   │  │  - DetailView            │ │ │
│  │  │   - CelebrationFX   │  │   │  │  - ThemePicker           │ │ │
│  │  │   - MotionReducer   │  │   │  │  - AnimationPicker       │ │ │
│  │  └─────────────────────┘  │   │  └──────────────────────────┘ │ │
│  │  ┌─────────────────────┐  │   │  ┌──────────────────────────┐ │ │
│  │  │   AudioEngine       │  │   │  │  ActivationControl       │ │ │
│  │  │   - CyclingSound    │  │   │  │  - ActivateAction        │ │ │
│  │  │   - RevealSound     │  │   │  │  - DeactivateAction      │ │ │
│  │  │   - MuteController  │  │   │  └──────────────────────────┘ │ │
│  │  └─────────────────────┘  │   │  ┌──────────────────────────┐ │ │
│  │  ┌─────────────────────┐  │   │  │  SharedUI                │ │ │
│  │  │   ThemeRenderer     │  │   │  │  - Navigation / Sidebar  │ │ │
│  │  │   - ThemeLoader     │  │   │  │  - Dialogs               │ │ │
│  │  │   - DynamicStyles   │  │   │  │  - Toasts                │ │ │
│  │  └─────────────────────┘  │   │  └──────────────────────────┘ │ │
│  └───────────────────────────┘   └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Backend Layer                                │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────────┐ │
│  │  API Gateway   │  │  Auth Service  │  │  Raffle Service       │ │
│  │  - Routing     │  │  - Login       │  │  - CreateRaffle       │ │
│  │  - CORS        │  │  - Session Mgmt│  │  - UpdateRaffle       │ │
│  │  - Rate Limit  │  │  - CSRF Tokens │  │  - DeleteRaffle       │ │
│  │  - Sec Headers │  │  - Password    │  │  - ResetDraws         │ │
│  │  - Validation  │  │    Hashing     │  │  - ActivateRaffle     │ │
│  └────────────────┘  └────────────────┘  │  - DeactivateRaffle   │ │
│                                          │  - GetActiveRaffle    │ │
│  ┌────────────────┐  ┌────────────────┐  │  - ListRaffles        │ │
│  │  Draw Service  │  │  Data Access   │  │  - GetRaffleDetail    │ │
│  │  - DrawName    │  │  - Repository  │  └───────────────────────┘ │
│  │  - Atomic Lock │  │  - Migrations  │                            │
│  │  - Validation  │  │  - Query Build │                            │
│  └────────────────┘  └────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.2.2 Component Responsibilities

| Component | Responsibility | Requirements |
|---|---|---|
| **DrawPage** | Renders the public raffle UI: heading, subheading, name display, draw button, mute toggle. Orchestrates animation and sound on draw. | L2-001, L2-002 |
| **AnimationEngine** | Manages name cycling animation with configurable styles (Slot Machine, Wheel Spin, Card Flip). Handles deceleration curve and celebration effects. Respects `prefers-reduced-motion`. | L2-031, L2-032, L2-033, L2-036 |
| **AudioEngine** | Plays cycling tick sounds synchronized with animation frame rate. Plays celebratory reveal sound. Manages mute state in session storage. | L2-037 |
| **ThemeRenderer** | Loads and applies per-raffle visual themes dynamically (colors, typography, background). | L2-035 |
| **AuthModule** | Login form, credential submission, session token storage, logout, session expiry detection. | L2-013, L2-014, L2-015 |
| **RaffleManagement** | CRUD forms for raffles including heading, subheading, participant list, theme picker, animation picker. Detail view with participant status and draw history. | L2-006, L2-007, L2-008, L2-009, L2-010, L2-034, L2-035, L2-036 |
| **ActivationControl** | Activate/deactivate actions with single-active invariant enforcement. | L2-011, L2-012 |
| **API Gateway** | HTTP routing, CORS policy, rate limiting, security headers, request validation, CSRF verification. | L2-018, L2-019, L2-020, L2-021 |
| **Auth Service** | Credential verification, bcrypt password hashing, session creation/validation/destruction. | L2-013, L2-014 |
| **Draw Service** | Atomic name selection from the undrawn pool. Ensures uniqueness under concurrency via database-level locking. | L2-004, L2-028 |
| **Raffle Service** | Business logic for raffle lifecycle: creation, update, deletion, reset, activation with single-active constraint. | L2-006–L2-012 |
| **Data Access** | Repository pattern over PostgreSQL. Parameterized queries. Schema migrations. | L2-018, L2-029 |

---

### 5.3 Information View

**Viewpoint:** Information
**Concerns addressed:** C-2, C-3, C-4, C-10

#### 5.3.1 Entity-Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────────────┐
│      admin_user      │       │           raffle              │
├──────────────────────┤       ├──────────────────────────────┤
│ id          UUID  PK │       │ id              UUID  PK     │
│ email       TEXT  UQ │       │ name            TEXT  UQ     │
│ password    TEXT     │       │ heading         TEXT  NN     │
│ created_at  TSTZ    │       │ subheading      TEXT         │
│ updated_at  TSTZ    │       │ theme           TEXT  NN     │
└──────────────────────┘       │ animation_style TEXT  NN     │
                               │ is_active       BOOL  NN     │
                               │ created_by      UUID  FK     │
                               │ created_at      TSTZ         │
                               │ updated_at      TSTZ         │
                               └──────────┬───────────────────┘
                                          │ 1
                                          │
                                          │ *
                               ┌──────────┴───────────────────┐
                               │       participant            │
                               ├──────────────────────────────┤
                               │ id          UUID  PK         │
                               │ raffle_id   UUID  FK  NN     │
                               │ name        TEXT  NN         │
                               │ is_drawn    BOOL  NN         │
                               │ drawn_at    TSTZ             │
                               │ draw_order  INT              │
                               │ created_at  TSTZ             │
                               ├──────────────────────────────┤
                               │ UQ(raffle_id, name)          │
                               │ IDX(raffle_id, is_drawn)     │
                               └──────────────────────────────┘
```

#### 5.3.2 Data Dictionary

| Entity | Field | Type | Constraints | Description |
|---|---|---|---|---|
| **admin_user** | id | UUID | PK, generated | Unique administrator identifier. |
| | email | TEXT | UNIQUE, NOT NULL | Login credential. |
| | password | TEXT | NOT NULL | bcrypt-hashed password. Never stored in plaintext. |
| **raffle** | id | UUID | PK, generated | Unique raffle identifier. |
| | name | TEXT | UNIQUE, NOT NULL | Administrative name for the raffle. |
| | heading | TEXT | NOT NULL, max 100 chars | Public page heading. |
| | subheading | TEXT | nullable, max 250 chars | Optional public page subheading. |
| | theme | TEXT | NOT NULL, default 'classic' | Visual theme key (e.g., 'cosmic', 'festive', 'corporate'). |
| | animation_style | TEXT | NOT NULL, default 'slot_machine' | Animation style key (e.g., 'slot_machine', 'wheel_spin', 'card_flip'). |
| | is_active | BOOLEAN | NOT NULL, default false | Whether this raffle is the currently active one. Enforced via partial unique index. |
| | created_by | UUID | FK → admin_user.id | Administrator who created this raffle. |
| **participant** | id | UUID | PK, generated | Unique participant entry identifier. |
| | raffle_id | UUID | FK → raffle.id, ON DELETE CASCADE | Parent raffle. |
| | name | TEXT | NOT NULL | Participant display name. |
| | is_drawn | BOOLEAN | NOT NULL, default false | Whether this name has been drawn. |
| | drawn_at | TIMESTAMPTZ | nullable | Timestamp of when the name was drawn. |
| | draw_order | INTEGER | nullable | Sequential draw number (1, 2, 3...). |

#### 5.3.3 Key Data Invariants

1. **Single-active raffle:** At most one row in `raffle` may have `is_active = true`. Enforced by a partial unique index: `CREATE UNIQUE INDEX uq_active_raffle ON raffle (is_active) WHERE is_active = true;`

2. **Unique participant names per raffle:** Enforced by the composite unique constraint `(raffle_id, name)`.

3. **Draw immutability:** Once `is_drawn = true` and `drawn_at` is set, these values are never reverted except by the explicit "Reset Draws" operation, which clears all draws for the raffle in a single transaction.

4. **Draw ordering:** `draw_order` is assigned atomically during the draw operation using `SELECT COALESCE(MAX(draw_order), 0) + 1` within the same transaction that marks the participant as drawn.

---

### 5.4 Concurrency View

**Viewpoint:** Concurrency
**Concerns addressed:** C-2, C-10

#### 5.4.1 Critical Section: Draw Operation

The draw operation is the primary concurrency-sensitive path. Multiple public visitors may click "Draw" simultaneously. The system must guarantee each draw returns a unique name.

**Strategy: Pessimistic row-level locking with `SELECT ... FOR UPDATE SKIP LOCKED`**

```
Sequence: Draw Name

Client A ─── POST /api/draw ──────► API Server
Client B ─── POST /api/draw ──────► API Server

API Server (for each request):
  1. BEGIN TRANSACTION
  2. SELECT id, name FROM participant
     WHERE raffle_id = :raffle_id
       AND is_drawn = false
     ORDER BY RANDOM()
     LIMIT 1
     FOR UPDATE SKIP LOCKED
  3. If no row returned → ROLLBACK, return 409 "No names remaining"
  4. UPDATE participant
     SET is_drawn = true,
         drawn_at = NOW(),
         draw_order = (SELECT COALESCE(MAX(draw_order),0)+1
                       FROM participant
                       WHERE raffle_id = :raffle_id)
     WHERE id = :selected_id
  5. COMMIT
  6. Return { name: selected_name, draw_order: N }
```

`FOR UPDATE SKIP LOCKED` ensures that if Client A locks a row, Client B skips that row and selects a different available participant. This eliminates deadlocks and guarantees uniqueness without serializing all requests.

#### 5.4.2 Activation Mutual Exclusion

Activating a raffle deactivates any currently active raffle. This is performed in a single transaction:

```sql
BEGIN;
UPDATE raffle SET is_active = false WHERE is_active = true;
UPDATE raffle SET is_active = true WHERE id = :raffle_id;
COMMIT;
```

The partial unique index on `is_active WHERE is_active = true` provides a database-level safety net: if a concurrent activation somehow bypasses the application logic, the constraint violation prevents dual-active state.

#### 5.4.3 Animation-Server Synchronization

The draw result is determined server-side before the animation begins. The client receives the winner's name in the API response and orchestrates a purely cosmetic cycling animation that always terminates on the pre-determined winner. This design ensures:

- The animation cannot "land" on a different name than the server selected.
- Network latency does not affect the draw outcome.
- The animation can be replayed or skipped without data integrity risk.

---

### 5.5 Deployment View

**Viewpoint:** Deployment
**Concerns addressed:** C-7, C-10, C-11

#### 5.5.1 Deployment Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Cloud Provider                            │
│                                                                  │
│  ┌──────────────┐    ┌───────────────────────────────────────┐  │
│  │     CDN      │    │         Application Platform          │  │
│  │              │    │                                       │  │
│  │  Static SPA  │    │  ┌─────────────────────────────────┐  │  │
│  │  bundles,    │    │  │      API Server (Node.js)       │  │  │
│  │  audio files,│    │  │                                 │  │  │
│  │  fonts       │    │  │  - Express/Fastify HTTP         │  │  │
│  │              │    │  │  - Auth middleware              │  │  │
│  └──────┬───────┘    │  │  - Rate limiter                 │  │  │
│         │            │  │  - CSRF middleware               │  │  │
│         │            │  │  - Security headers              │  │  │
│         │ HTTPS      │  └──────────────┬──────────────────┘  │  │
│         │            │                 │                      │  │
│         ▼            │                 │ TCP/TLS              │  │
│  ┌──────────────┐    │                 ▼                      │  │
│  │   Browser    │    │  ┌─────────────────────────────────┐  │  │
│  │              │    │  │    PostgreSQL Database           │  │  │
│  │  Public SPA  │    │  │                                 │  │  │
│  │  BackOffice  │    │  │  - Managed instance             │  │  │
│  │  SPA         │    │  │  - Automated backups            │  │  │
│  │              │◄───┤  │  - Encrypted at rest            │  │  │
│  │  Web Audio   │    │  └─────────────────────────────────┘  │  │
│  │  API (sound) │    │                                       │  │
│  └──────────────┘    └───────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

#### 5.5.2 Infrastructure Components

| Component | Technology | Purpose | Scaling |
|---|---|---|---|
| **CDN** | Cloudflare / AWS CloudFront | Serve static SPA bundles, audio files, theme CSS, fonts. TLS termination. | Horizontally scaled by provider. |
| **API Server** | Node.js (LTS) on containerized platform | Serve REST API. Stateless; session data in DB or signed cookies. | Horizontal — add container replicas behind load balancer. |
| **Database** | PostgreSQL 16+ (managed) | Durable storage for all application data. | Vertical scaling; read replicas if needed. |
| **Load Balancer** | Cloud-native (ALB / Cloud Load Balancing) | Distribute API traffic across server replicas. Health checks. | Managed by provider. |

#### 5.5.3 Environment Strategy

| Environment | Purpose | Database | Access |
|---|---|---|---|
| **Development** | Local development and debugging | Local PostgreSQL or Docker | Developer machine |
| **Staging** | Pre-production verification, E2E tests | Isolated managed PostgreSQL | Internal team |
| **Production** | Live system serving real users | Managed PostgreSQL with backups | Public (SPA), Authenticated (API admin routes) |

---

### 5.6 Development View

**Viewpoint:** Development
**Concerns addressed:** C-9, C-6, C-8

#### 5.6.1 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Public SPA** | React 19, TypeScript | Component model well-suited for animation orchestration. TypeScript for type safety across shared contracts. |
| **Back Office SPA** | React 19, TypeScript | Shared component library with public SPA. Consistent developer experience. |
| **Styling** | Tailwind CSS 4 | Utility-first approach supports rapid responsive design across breakpoints. Theme customization via CSS custom properties. |
| **Animation** | Framer Motion | Declarative animation library with `prefers-reduced-motion` support built in. Spring physics for natural deceleration. |
| **Audio** | Web Audio API (via Howler.js) | Precise timing synchronization with animation frames. Cross-browser compatibility. |
| **API Server** | Node.js, Express, TypeScript | Same language as frontend enables shared type definitions. Mature middleware ecosystem. |
| **ORM / Query** | Prisma | Type-safe database access, migration management, parameterized queries by default (SQL injection prevention). |
| **Database** | PostgreSQL 16+ | Row-level locking (`FOR UPDATE SKIP LOCKED`), partial unique indexes, ACID transactions for draw integrity. |
| **Authentication** | bcrypt + signed HTTP-only cookies | No client-side token exposure. Session invalidation on logout. |
| **Testing** | Vitest (unit), Playwright (E2E) | Fast unit test runner with native TypeScript. Playwright for cross-browser E2E including accessibility checks. |
| **Linting** | ESLint 9, Prettier | Enforced code standards per L2-026. |
| **CI/CD** | GitHub Actions | Automated lint, test, build, deploy pipeline. |

#### 5.6.2 Repository Structure

```
raffle/
├── docs/
│   ├── specs/
│   │   ├── L1.md                   # High-level requirements
│   │   └── L2.md                   # Detailed requirements
│   ├── architecture.md             # This document
│   └── raffle-app-designs.pen      # UI designs
├── packages/
│   ├── shared/                     # Shared types and contracts
│   │   ├── src/
│   │   │   ├── types/              # Raffle, Participant, Theme, AnimationStyle
│   │   │   └── validation/         # Shared validation schemas (zod)
│   │   └── package.json
│   ├── client/                     # Frontend applications
│   │   ├── src/
│   │   │   ├── public-app/         # Public raffle SPA
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   ├── animations/     # Animation engine (per-style modules)
│   │   │   │   ├── audio/          # Audio engine
│   │   │   │   └── themes/         # Theme loader and CSS custom properties
│   │   │   ├── admin-app/          # Back office SPA
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   └── auth/
│   │   │   └── shared-ui/          # Shared UI components (buttons, inputs, etc.)
│   │   ├── public/
│   │   │   └── audio/              # Sound effect files (.mp3/.ogg)
│   │   └── package.json
│   └── server/                     # Backend API
│       ├── src/
│       │   ├── routes/             # Express route handlers
│       │   ├── services/           # Business logic (DrawService, RaffleService, AuthService)
│       │   ├── middleware/         # Auth, CSRF, rate limit, security headers, validation
│       │   ├── repositories/      # Data access layer
│       │   └── config/            # Environment configuration
│       ├── prisma/
│       │   ├── schema.prisma      # Database schema
│       │   └── migrations/        # Migration files
│       └── package.json
├── e2e/                           # Playwright E2E tests
├── turbo.json                     # Turborepo configuration
└── package.json                   # Root workspace
```

#### 5.6.3 Module Dependency Rules

1. `shared` has zero dependencies on `client` or `server`.
2. `client` depends on `shared` for types and validation schemas.
3. `server` depends on `shared` for types and validation schemas.
4. `client` never imports from `server` and vice versa.
5. Within `client`, `public-app` and `admin-app` may both import from `shared-ui` but not from each other.
6. Within `server`, `routes` depend on `services`, `services` depend on `repositories`. No reverse dependencies.

---

## 6. Architecture Decisions

### ADR-001: Single-Page Application Architecture

**Context:** The public draw page requires fluid animations, synchronized audio, and immediate UI state transitions without page reloads. The back office requires interactive forms with real-time validation.

**Decision:** Both the public and back office interfaces are implemented as SPAs communicating with a REST API.

**Consequences:** Client-side routing, SPA-specific security considerations (CSRF tokens via API, CSP configuration for inline styles from themes), SEO is not a concern for either app.

**Traceability:** L1-001, L1-011, L2-031, L2-032, L2-037

---

### ADR-002: Server-Determined Draw Result

**Context:** The draw outcome could be computed client-side or server-side.

**Decision:** The server selects the winner atomically and returns the result. The client receives the winner before the animation begins and orchestrates a cosmetic animation that always terminates on the server-determined name.

**Rationale:** Server-side determination is the only way to guarantee draw uniqueness under concurrency (L2-004, L2-028). Client-side randomization would create race conditions where two browsers could "draw" the same name.

**Consequences:** The API response time adds latency before the animation starts (mitigated by showing a loading state). The participant name list must be sent to the client for cycling display, but the draw decision is never delegated.

**Traceability:** L1-002, L2-004, L2-028, L2-031

---

### ADR-003: PostgreSQL FOR UPDATE SKIP LOCKED for Draw Concurrency

**Context:** Multiple simultaneous draw requests must each receive a unique participant.

**Decision:** Use `SELECT ... FOR UPDATE SKIP LOCKED` within a transaction to atomically select and mark a participant as drawn.

**Rationale:** `SKIP LOCKED` is superior to `FOR UPDATE` (which blocks, reducing throughput) and optimistic locking (which requires retries). It allows concurrent transactions to proceed without blocking, each locking a different row.

**Consequences:** Requires PostgreSQL 9.5+. The random selection across unlocked rows may have slightly different statistical distribution under extreme concurrency, but this is acceptable for a raffle where any undrawn name is a valid outcome.

**Traceability:** L2-004, L2-028

---

### ADR-004: Partial Unique Index for Single-Active Invariant

**Context:** Exactly zero or one raffle may be active at any time.

**Decision:** Enforce via `CREATE UNIQUE INDEX uq_active_raffle ON raffle (is_active) WHERE is_active = true;`

**Rationale:** Application-level enforcement alone is insufficient under concurrent admin requests. The database constraint provides an absolute guarantee that cannot be bypassed by application bugs.

**Consequences:** Activation requires a transaction that first deactivates any active raffle, then activates the target. The unique index will reject any attempt to have two active raffles.

**Traceability:** L1-004, L2-011

---

### ADR-005: Theme and Animation as Data, Not Code

**Context:** Administrators select visual themes and animation styles per raffle.

**Decision:** Themes are defined as CSS custom property sets loaded dynamically. Animation styles are defined as named configuration objects that parameterize the AnimationEngine. Both are registered in code but selected via string keys stored in the database.

**Rationale:** This allows adding new themes and animations by adding a code module and registering it, without database schema changes. The database stores only a key (e.g., `"cosmic"`, `"slot_machine"`), and the client resolves it to the appropriate rendering logic.

**Consequences:** Adding a new theme or animation requires a code deployment. This is acceptable given the small, curated set (3+ of each per L2-035, L2-036).

**Traceability:** L2-035, L2-036

---

### ADR-006: Audio Muted by Default

**Context:** Browser autoplay policies block audio playback without prior user interaction. The draw page plays sound during the cycling animation.

**Decision:** Sound is muted by default. The user's first click on "Draw" constitutes user interaction, enabling audio playback. A visible mute/unmute toggle persists the preference in `sessionStorage`.

**Rationale:** Complies with browser autoplay policies (L2-037). The "Draw" button click is a natural interaction point — users who click "Draw" have demonstrated engagement and are expecting a response.

**Consequences:** Sound plays on the first draw without requiring a separate "enable sound" step. Users who prefer silence can mute via the toggle.

**Traceability:** L2-037

---

### ADR-007: Monorepo with Turborepo

**Context:** The system has three packages (shared, client, server) with type dependencies between them.

**Decision:** Use a monorepo with Turborepo for orchestrating builds, tests, and deployments across packages.

**Rationale:** Shared types between frontend and backend are defined once and imported directly, eliminating contract drift (L2-027). Turborepo provides incremental builds and task caching.

**Consequences:** Single repository to manage. CI pipelines must understand the workspace structure. Deployment scripts extract and deploy client and server packages independently.

**Traceability:** L2-027

---

## 7. Cross-Cutting Concerns

### 7.1 Security

Security is addressed across all views:

- **Information View:** Passwords are bcrypt-hashed. No plaintext secrets in the database.
- **Functional View:** Auth middleware protects all `/api/admin/*` routes. CSRF tokens on all state-changing requests.
- **Deployment View:** HTTPS everywhere. HSTS with 1-year max-age. Security headers (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) on all responses.
- **Development View:** Parameterized queries via Prisma (SQL injection prevention). Output encoding in React (XSS prevention by default). Rate limiting on login endpoint.

**Traceability:** L1-007, L2-018, L2-019, L2-020, L2-021

### 7.2 Accessibility

- **Functional View:** AnimationEngine includes MotionReducer that detects `prefers-reduced-motion` and substitutes fade-in for cycling animation. ARIA live regions announce draw results.
- **Development View:** All themes validated against WCAG 2.2 AA contrast ratios (4.5:1 normal text, 3:1 large text). Semantic HTML enforced by ESLint plugin (eslint-plugin-jsx-a11y). Playwright E2E tests include axe-core accessibility audits.
- **Information View:** Theme definitions include contrast-validated color pairs.

**Traceability:** L1-008, L2-022, L2-023, L2-024, L2-033

### 7.3 Error Handling

- **Functional View:** Global error boundary in React catches rendering failures. API responses use structured error format `{ error: { code, message } }`. Server errors return generic messages; details logged server-side only.
- **Deployment View:** Application logs shipped to centralized logging. Health check endpoint at `/api/health` for load balancer probes.

**Traceability:** L1-010, L2-030

---

## 8. Correspondence and Consistency

### 8.1 View Correspondence Rules

| Rule | Views | Description |
|---|---|---|
| CR-1 | Functional ↔ Information | Every service in the Functional View that persists data maps to entities in the Information View. DrawService writes to `participant`. RaffleService writes to `raffle` and `participant`. AuthService reads from `admin_user`. |
| CR-2 | Functional ↔ Deployment | Each functional component maps to a deployment artifact. Public SPA and BackOffice SPA deploy to CDN. API Gateway, Auth Service, Draw Service, Raffle Service, and Data Access deploy as a single API Server container. |
| CR-3 | Information ↔ Concurrency | The locking strategy in the Concurrency View operates on the `participant` entity defined in the Information View. The partial unique index on `raffle.is_active` is the mechanism enforcing the single-active invariant described in both views. |
| CR-4 | Development ↔ Functional | The package structure in the Development View maps to the component groupings in the Functional View. `packages/client/src/public-app/animations/` implements AnimationEngine. `packages/server/src/services/` implements Draw Service and Raffle Service. |

### 8.2 Known Inconsistencies

None identified at this revision.

---

## 9. Requirements Traceability Matrix

| Requirement | Architecture Element(s) |
|---|---|
| L1-001, L2-001 | DrawPage, DrawService, AnimationEngine, AudioEngine |
| L1-002, L2-004 | DrawService (atomic lock), participant.is_drawn, FOR UPDATE SKIP LOCKED |
| L1-003, L2-006, L2-007, L2-008, L2-009, L2-010 | RaffleManagement, RaffleService, raffle entity, participant entity |
| L1-004, L2-011, L2-012 | ActivationControl, RaffleService, partial unique index on is_active |
| L1-005, L2-013, L2-014, L2-015 | AuthModule, AuthService, admin_user entity, session cookies |
| L1-006, L2-016, L2-017 | Tailwind CSS responsive utilities, shared-ui components |
| L1-007, L2-018–L2-021 | API Gateway middleware, Prisma parameterized queries, security headers |
| L1-008, L2-022–L2-024, L2-033 | MotionReducer, ARIA live regions, theme contrast validation, jsx-a11y |
| L1-009, L2-025–L2-027 | Monorepo structure, ESLint/Prettier, Vitest/Playwright, module dependency rules |
| L1-010, L2-028–L2-030 | FOR UPDATE SKIP LOCKED, PostgreSQL managed backups, error boundaries, structured logging |
| L1-011, L2-031, L2-032, L2-037 | AnimationEngine, AudioEngine, ThemeRenderer, ADR-002, ADR-005, ADR-006 |
| L2-034 | raffle.heading, raffle.subheading, DrawPage HeadingDisplay |
| L2-035 | raffle.theme, ThemeRenderer, ThemePicker |
| L2-036 | raffle.animation_style, AnimationEngine style modules, AnimationPicker |

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Active Raffle** | The single raffle currently presented on the public drawing page. At most one raffle may be active at any time. |
| **Draw** | The act of randomly selecting one undrawn participant name from a raffle. Irreversible except via Reset. |
| **Cycling Animation** | The visual effect of rapidly displaying candidate names before decelerating to the winner. |
| **Theme** | A named set of visual properties (colors, typography, background) applied to the public raffle page. |
| **Animation Style** | A named configuration defining the cycling behavior and celebratory reveal effect. |
| **SPA** | Single-Page Application — a web application that dynamically rewrites the page rather than loading entire new pages. |
| **Partial Unique Index** | A PostgreSQL index that enforces uniqueness only on rows matching a WHERE clause. |
| **SKIP LOCKED** | A PostgreSQL row-locking mode where locked rows are silently skipped rather than waited on. |
