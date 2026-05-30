# Playtest Plan

The first implementation should be tested for clarity and game feel before
adding polish. Numerical values marked `[PLACEHOLDER]` in the game design should
be revisited after playtests.

## Test Goals

1. Confirm players understand the route rules.
2. Confirm 90 seconds is enough to interact with the UI.
3. Confirm invalid-route feedback is understandable.
4. Confirm event randomness feels fair.
5. Confirm replay motivation exists after seeing the result.

## Test Setup

Use at least three test accounts:

- one new tester with no network knowledge;
- one tester after two practice games;
- one tester familiar with the network.

For each tester, record:

- setup study time;
- planning route length;
- whether route was valid;
- final score;
- invalid reason if any;
- where the tester hesitated;
- whether the tester wanted to play again.

## Playtest Scenarios

| Scenario | Observation target |
| --- | --- |
| First login and setup | Does the player understand what to study? |
| First planning phase | Does the player know how to select and edit route segments? |
| Timeout | Does auto-submit feel understandable? |
| Invalid route | Does the reason explain the failure? |
| Valid execution | Do event effects and coin totals make sense? |
| Ranking | Does best-score comparison motivate replay? |

## Success Criteria

The design is ready for final polish if:

- at least 80% of testers understand the basic objective after reading
  instructions;
- at least 70% of second attempts produce a valid route;
- no tester fails because they cannot operate the route builder;
- testers can explain why an invalid route failed after seeing the result;
- testers describe events as suspenseful rather than arbitrary punishment.

## Broken Signals

Revise the design if:

- testers spend most of planning fighting the UI;
- testers do not notice interchanges;
- testers think random events happen before route validation;
- testers cannot tell whether score 0 is a bug or a rule;
- testers do not want to retry after an invalid route.

## Tuning Actions

| Problem | Possible change |
| --- | --- |
| Players cannot find useful segments | Improve segment list grouping or add station filters. |
| Players misunderstand line changes | Strengthen interchange visual marker and setup rule text. |
| Timer feels too stressful | Improve route editing speed; do not change 90s because exam fixes it. |
| Events feel too punishing | Adjust event distribution toward neutral, not beyond exam effect range. |
| Ranking feels unclear | Add completed-games count and deterministic tie-break display. |
