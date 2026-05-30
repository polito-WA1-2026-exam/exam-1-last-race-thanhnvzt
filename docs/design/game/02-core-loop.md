# Core Gameplay Loop

## Moment-to-Moment Loop: Planning Clicks

Time scale: 0-30 seconds.

- Action: the player scans the segment list and selects the next segment.
- Decision: choose a segment that continues the route and preserves line
  continuity.
- Feedback: the selected route list updates immediately with ordered steps.
- Reward: the route visibly grows toward the destination.
- Tension: the countdown continues while the player searches and verifies.

## Session Loop: One Game Attempt

Time scale: 3-8 minutes.

1. Study the full network in setup.
2. Start a game.
3. Receive random start and destination.
4. Build a route within 90 seconds.
5. Submit manually or by timeout.
6. If invalid, receive score 0 with a reason.
7. If valid, watch events execute step by step.
8. See final score.
9. Start another game or view ranking.

Session goal:

- reach the destination with the highest possible score.

Session tension:

- route uncertainty;
- 90-second planning timer;
- event variance per segment.

Session resolution:

- valid route resolves into event sequence and score;
- invalid route ends immediately with score 0.

## Long-Term Loop: Improve and Replay

Time scale: multiple sessions.

- The player learns the fixed network.
- Faster route reconstruction leads to more consistent valid routes.
- Better route choices reduce unnecessary segment exposure.
- Best score ranking creates a replay target.

No permanent upgrades are planned. The long-term progression is player skill and
ranking performance, not character growth.

## Player Motivation Map

| Motivation | Design support |
| --- | --- |
| Mastery | Fixed network, hidden planning connections, route validation. |
| Tension | Timer, random start/destination, auto-submit. |
| Surprise | Random events during execution. |
| Competition | Best-score ranking among registered users. |
| Recovery | New game is always available after result. |

## Failure Definition

The loop is not working if:

- players ignore the setup map and still succeed often;
- players fail mostly because the interface is slow or confusing;
- random events dominate score more than route quality;
- invalid route reasons are unclear;
- replay feels identical because start/destination variety is too low.
