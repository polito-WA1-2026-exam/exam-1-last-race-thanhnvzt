# Game Design: Last Race

This folder defines the game experience of Last Race: what the player does,
what decisions matter, how scoring works, and how the system should be tuned.
It complements the technical design documents:

- [Domain Model](../02-domain-model.md)
- [Database Design](../03-database.md)
- [API Contract](../04-api-contract.md)
- [Game Flow](../06-game-flow.md)

## Documents

1. [Design Pillars](./01-design-pillars.md)
2. [Core Gameplay Loop](./02-core-loop.md)
3. [Mechanics Specifications](./03-mechanics.md)
4. [Economy and Balance](./04-economy-balance.md)
5. [Onboarding and Player Guidance](./05-onboarding.md)
6. [Playtest Plan](./06-playtest-plan.md)
7. [Network Design](./07-network-design.md)

## Game Summary

Last Race is a single-player route-planning game. The player studies a fictional
underground network, then must reconstruct a valid route from memory under a
90-second planning timer. If the route is valid, the journey executes one
segment at a time and random events add or remove coins. If the route is invalid
or incomplete, the game ends with score 0.

## Fun Hypothesis

The game works if the player feels a clear tension between memory, planning
speed, and risk:

```txt
"I know the network well enough to build a route before time runs out, but each
extra step could expose me to more random events."
```

The core fun is not movement control. It is the pressure of reconstructing a
hidden connection map from memory and then watching the planned journey resolve.

## Version History

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-05-30 | Initial game design package for Last Race. |
