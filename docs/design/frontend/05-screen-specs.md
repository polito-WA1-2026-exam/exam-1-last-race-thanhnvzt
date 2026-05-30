# Screen Specifications

These specifications define the intended desktop layout for each route.

## Shared App Shell

Layout:

```txt
TopNav
MainContent
```

TopNav contents:

- app name: Last Race;
- setup link for logged users;
- ranking link for logged users;
- user name and logout for logged users;
- login link for anonymous users.

MainContent:

- max width can be full viewport for game screens;
- standard page padding: 24px;
- no content hidden behind fixed navigation.

## Instructions Page

Purpose:

- explain rules to anonymous users;
- invite login;
- avoid exposing the network map.

Layout:

- compact title and rules panel;
- "Login to play" action;
- no decorative full-screen hero.

## Login Page

Purpose:

- authenticate seeded users.

Layout:

- centered form panel, max width about 420px;
- username and password labels;
- submit button with loading state;
- controlled error message for invalid credentials.

No registration link.

## Setup Page

Purpose:

- let logged users study the full network before the timed phase.

Layout:

```txt
Header row: title, short status, Start game button
Map area: full network SVG
Side panel: line legend and brief rules
```

UI details:

- line colors and names visible;
- interchange stations visually marked;
- map has stable dimensions to avoid layout shift;
- start-game button disabled while request is pending.

## Planning Page

Purpose:

- build a route from the segment list within 90 seconds.

Layout:

```txt
Top strip: start -> destination, timer, submit button
Left: station-only map
Middle: segment list
Right: selected route builder
```

UI details:

- station-only map must not draw connecting lines;
- segment list is scrollable with sticky header;
- selected route shows ordered steps;
- remove-last and clear-route controls are available;
- warnings are phrased as "preview" or "possible issue", not final validation;
- timer changes visual emphasis below 15 seconds but remains text-readable.

## Execution Page

Purpose:

- show server-returned route steps one at a time.

Layout:

```txt
Header: route and score summary
Main: current step event panel
Side: compact timeline of steps
Footer action: next step / view result
```

UI details:

- event effect uses plus/minus sign and color;
- score after step is prominent;
- next-step button is disabled during transition if animation is used;
- no random choices happen in this page.

## Result Page

Purpose:

- show final score and route validity result.

Layout:

- result summary panel;
- final score;
- invalid reason if applicable;
- actions: new game, ranking, setup.

UI details:

- invalid result must clearly say execution was skipped;
- score 0 should not look like a technical error.

## Ranking Page

Purpose:

- display best result per user.

Layout:

- table with position, player, best score, completed games;
- empty state if no games exist;
- loading panel during fetch.

UI details:

- sort descending by score;
- rank indicators are text/numbers, not only colors;
- current user row may be highlighted if easy to implement.
