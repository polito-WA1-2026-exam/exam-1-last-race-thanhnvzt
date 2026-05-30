# Design Pillars

Design pillars are the non-negotiable player experiences. Every mechanic should
support at least one pillar.

## Pillar 1: Memorized Network Mastery

The player should feel that studying the setup map matters. Success comes from
remembering stations, interchanges, and line continuity.

Design implications:

- setup shows the full network clearly;
- planning hides the connections;
- segment list remains available so the challenge is reconstruction, not blind
  guessing;
- start and destination are far enough apart to require real route planning.

## Pillar 2: Timed Route Commitment

The player should feel pressure to commit before they are fully certain.

Design implications:

- planning lasts 90 seconds;
- the selected route is submitted automatically when time expires;
- route edits should be fast: select segment, remove last, clear route;
- duplicate submission should be impossible.

## Pillar 3: Transparent Rule Fairness

The player should understand why a route succeeded or failed.

Design implications:

- setup should make line continuity and interchanges visually clear;
- planning should show selected steps in order;
- invalid results should show a short reason;
- line changes should fail only when the shared station is not a valid
  interchange.

## Pillar 4: Uncertain Journey Outcome

A valid route should not guarantee the same score every time. Random events make
shorter and cleaner routes feel valuable.

Design implications:

- every executed segment triggers one random event;
- events have small positive or negative coin effects;
- longer routes expose the player to more variance;
- execution reveals events step by step, not all at once.

## Pillar 5: Repeatable Score Chase

Registered users should want to replay because each game has a different
start/destination pair and ranking compares best results.

Design implications:

- start and destination are randomly assigned by the server;
- users can play unlimited games;
- best score appears in the ranking;
- new-game action is clear after results.

## Anti-Pillars

The game should not become:

- a hidden-information puzzle where the player lacks enough data;
- a pure luck game where route quality barely matters;
- a UI dexterity challenge where selecting segments is harder than planning;
- a complex simulation with rules the player cannot infer.
