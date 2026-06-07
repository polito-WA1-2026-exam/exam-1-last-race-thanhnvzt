# Economy and Balance

The game economy is intentionally small: coins are both the journey resource and
the final score. There are no purchases, upgrades, or permanent unlocks.

## Economy Sources and Sinks

| Type | Source/Sink | Description |
| --- | --- | --- |
| Source | Initial coins | Every game starts with 20 coins. |
| Source | Positive events | Events may add +1 to +4 coins. |
| Sink | Negative events | Events may remove -1 to -4 coins. |
| Sink | Invalid route | Invalid or incomplete route sets score to 0. |
| Clamp | Final score floor | Negative final coin totals are stored/displayed as 0. |

## Balance Intent

Route quality should matter more than luck over repeated play.

Design implications:

- longer routes trigger more events and therefore more variance;
- shorter valid routes reduce exposure to negative events;
- event effects are small relative to 20 starting coins;
- invalid route penalty is severe to make rule understanding important.

## Tuning Table

| Variable | Base Value | Min | Max | Tuning Notes |
| --- | ---: | ---: | ---: | --- |
| Starting coins | 20 | 20 | 20 | Fixed by exam. |
| Planning duration | 90s | 90s | 90s | Fixed by exam. |
| Minimum start-destination distance | 3 segments | 3 | `[PLACEHOLDER] 6` | Minimum fixed by exam; max should be tested if assignments feel too hard. |
| Event effect | -4 to +4 | -4 | +4 | Fixed range by exam. |
| Low-time warning threshold | `[PLACEHOLDER] 15s` | 10s | 20s | UI tuning; should create urgency without panic. |
| Planning draft save frequency | every route edit | - | - | Preserves the route built so far for timeout and reload recovery. |
| Event duplicate policy | `[PLACEHOLDER] allowed` | - | - | Allowing duplicates keeps implementation simple; test if repetition feels poor. |
| Ranking tie-break | `[PLACEHOLDER] name ascending` | - | - | Deterministic and explainable. |

## Event Catalog Balance

Recommended initial event distribution:

| Description | Effect | Role |
| --- | ---: | --- |
| Quiet journey | 0 | neutral |
| Found a dropped token | +1 | small positive |
| Helpful passenger shares a shortcut | +2 | positive |
| Express train arrives early | +3 | strong positive |
| Station musician inspires the trip | +4 | rare-feeling high positive |
| Crowded carriage slows the trip | -1 | small negative |
| Wrong platform delay | -2 | negative |
| Ticket inspection surcharge | -3 | strong negative |
| Missed connection | -4 | high negative |

With uniform random selection, the example set has expected value 0:

```txt
sum effects = 0
average effect = 0 / 9 = 0
```

This makes route length mainly a variance choice, not a guaranteed profit or
loss. If playtests show scores are too flat, adjust event probabilities rather
than increasing effect magnitude.

## Paper Simulation Targets

Before implementation tuning, use these rough targets:

| Route length | Expected score | Desired feel |
| ---: | ---: | --- |
| 3 steps | about 20 | Short valid routes feel stable. |
| 5 steps | about 20 | Medium routes feel suspenseful but fair. |
| 8+ steps | about 20 with high variance | Long routes feel risky. |

Because average event value is 0, expected score stays near 20 for valid routes.
The route-length pressure comes from variance and from the risk of making a
validation mistake.

## Broken Balance Signals

The economy needs revision if:

- valid routes often score below 5, making events feel too punishing;
- valid routes often score above 35, making ranking inflate too quickly;
- players prefer very long routes because events feel mostly positive;
- players ignore route optimization because score differences feel random;
- invalid route penalty discourages replay instead of teaching the route rules.
