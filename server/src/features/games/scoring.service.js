import {randomItem} from "../../shared/random.js";

export function scoreResolvedSteps(resolvedSteps, events, initialCoins) {
  if (events.length === 0) {
    throw new Error('Cannot score route without events');
  }

  let coins = initialCoins;

  const scoredSteps = resolvedSteps.map((step) => {
    const event = randomItem(events);
    coins += event.effect;

    return {
      ...step,
      eventId: event.id,
      event,
      coinsAfterStep: coins,
    };
  });

  return {
    finalCoins: coins,
    score: Math.max(coins, 0),
    scoredSteps,
  };
}
