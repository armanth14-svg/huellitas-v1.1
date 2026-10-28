# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Huellitas UPTC: a small pet-daycare intake app in plain JavaScript + HTML (code, comments and UI are in Spanish). Per `LEEME.md`, it is the **system under test** for a testing course: the requirements document (not in the repo) says what it should do, and students find where it deviates. Requirement IDs (R4, R7, R8…) appear in file header comments. Don't silently "fix" behavior that differs from what you'd expect — it may be an intentional defect; ask first.

## Commands

- Run the app: open `index.html` in a browser. No server, install, or internet needed. Data lives in memory and resets on reload.
- Run the dev team's unit tests (needs Node, no install): `node --test` (or `node --test pruebas/`)
- Run one test by name: `node --test --test-name-pattern="perro de 12 kg" pruebas/`

There is no package.json, build step, bundler, or linter.

## Architecture

Layered, SOLID-oriented (see table in `LEEME.md`):

- `js/dominio/` — business logic, no DOM access.
  - `especies.js` — per-species config (base rate, max weight, rabies-vaccine requirement). Data only; injected into rules and the calculator.
  - `reglas/Regla*.js` — one validation rule per field. Contract: `validar(datos)` → array of `{ campo, mensaje }` (empty = valid). `campo` matches the form field id / `data-error-de` attribute.
  - `ValidadorIngreso` — flat-maps all injected rules.
  - `CalculadoraTarifa` — daily rate (overweight surcharge, student discount).
  - `EstadoIngreso` — state machine; the `TRANSICIONES` table is the single source of truth for allowed actions (the UI always shows both buttons).
  - `ServicioIngresos` — use cases (`registrar`, `registrarLlegada`, `entregar`, `listar`); all collaborators injected via constructor.
- `js/infraestructura/RepositorioEnMemoria.js` — `siguienteCodigo` (`ING-001`…), `guardar`, `buscar`, `listar`; returns copies.
- `js/ui/` — `VistaFormulario` and `VistaIngresos` (DOM only).
- `js/app.js` — composition root: the only place objects are instantiated and wired. New rules are registered here.

### Module pattern (important)

No ES modules. Every file is an IIFE ending in the same `exportar(nombre, valor)` shim: under Node it sets `module.exports = valor` (so tests `require` each file directly); in the browser it attaches to the global `window.Guarderia[nombre]`. New files must:
1. Use the same wrapper.
2. Be added as a `<script>` tag in `index.html` in dependency order (domain → infrastructure → UI → `app.js` last).
3. Be `require`d in `pruebas/dominio.test.js` if tested.
