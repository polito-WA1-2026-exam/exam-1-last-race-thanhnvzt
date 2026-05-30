# Onboarding and Player Guidance

The exam does not require a tutorial mode, but the first play session must still
teach the game clearly through the instructions, setup screen, and feedback.

## Onboarding Goals

- The player understands that only logged users can play.
- The player understands the four phases: setup, planning, execution, result.
- The player understands the route must start and end at assigned stations.
- The player understands line changes are allowed only at interchanges.
- The player understands invalid routes score 0.
- The player understands random events affect coins only after a valid route.

## Public Instructions Page

The public page should explain:

1. Study the network after login.
2. Start a game to receive a random start and destination.
3. Build a route from segment pairs within 90 seconds.
4. Submit before time runs out, or the current route is submitted automatically.
5. Valid routes execute with random events.
6. Invalid routes score 0.
7. Best results appear in the ranking for logged users.

The public page must not show the network map.

## Setup Guidance

The setup page should teach through the map:

- line legend uses line names and colors;
- interchange stations are visibly marked;
- brief rule reminder appears near the map;
- start-game button is clear but does not rush the player.

Suggested copy:

```txt
Study the full network. In planning, the connections disappear and you will
rebuild your route from the segment list.
```

## Planning Guidance

The planning page should support fast understanding:

- top strip shows `Start -> Destination`;
- timer is always visible;
- segment list uses station-pair labels;
- selected route is numbered;
- remove-last and clear controls are available;
- client preview warnings are allowed but must not claim final validity.

Suggested preview warning:

```txt
This segment may not continue from your current route.
```

Avoid saying:

```txt
Invalid route.
```

Only the server decides final validity.

## Execution Guidance

Execution should teach scoring:

- each step shows from station, to station, and line;
- event description appears with signed effect;
- coin total after the event is visible;
- the next-step action controls pacing.

Suggested event line:

```txt
Wrong platform delay: -2 coins. Current total: 18.
```

## Result Guidance

Valid result should show:

- final score;
- route summary;
- actions to play again or view ranking.

Invalid result should show:

- score 0;
- short invalid reason;
- action to return to setup or start another game.

Suggested invalid text:

```txt
Execution skipped because the route did not reach the destination.
```

## Onboarding Checklist

- [ ] Core objective is visible before login.
- [ ] Full map is visible before any timer starts.
- [ ] First timed action is selecting a segment from a clear list.
- [ ] Timer, start, and destination remain visible during planning.
- [ ] Route edits are reversible before submission.
- [ ] Invalid result explains the reason in one sentence.
- [ ] New-game action is visible after every result.
