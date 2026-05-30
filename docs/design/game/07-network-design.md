# Network Design

The network is part of the game design, not only seed data. It controls memory
load, route variety, interchange decisions, and how often players face meaningful
line-change choices.

## Design Goals

- Satisfy the exam minimums: at least 4 lines, 12 stations, and 3 interchange
  stations.
- Keep station names fictional and readable.
- Provide enough interchanges for multiple valid routes.
- Avoid a simple straight-line network where route choices are obvious.
- Keep the network small enough to memorize during setup.

## Station List

| Station | Gameplay role |
| --- | --- |
| Aurora Gate | Red Line endpoint; simple start/destination candidate. |
| Museum Square | Early Red/Green interchange. |
| Central Spire | Major hub connecting Red, Blue, and Violet. |
| Harbor Market | Red Line middle station with no interchange. |
| West Garden | Red/Gold interchange and Red endpoint. |
| North Library | Blue Line endpoint. |
| Glassworks | Blue/Gold interchange. |
| River Forum | Blue/Green interchange. |
| South Arena | Blue/Gold endpoint/interchange. |
| Old Foundry | Green/Violet interchange. |
| Hill Observatory | Green Line middle station with no interchange. |
| East Depot | Green/Gold endpoint/interchange. |
| Clocktower | Gold/Violet interchange. |
| Canal Court | Violet Line endpoint. |

There are 14 stations, which gives enough route variety while staying manageable
for a short memory challenge.

## Line Configuration

| Line | Stations in order | Design purpose |
| --- | --- | --- |
| Red Line | Aurora Gate -> Museum Square -> Central Spire -> Harbor Market -> West Garden | Simple east-west spine with two interchanges and one non-interchange middle step. |
| Blue Line | North Library -> Central Spire -> Glassworks -> River Forum -> South Arena | Connects the central hub to the lower network and creates several route options. |
| Green Line | Museum Square -> Old Foundry -> River Forum -> Hill Observatory -> East Depot | Crosses the Red/Blue system and creates memory pressure around Old Foundry and River Forum. |
| Gold Line | West Garden -> Clocktower -> Glassworks -> East Depot -> South Arena | Provides alternate routes across the right side of the map. |
| Violet Line | Canal Court -> Old Foundry -> Central Spire -> Clocktower | Short connector line that creates hub-to-hub shortcuts. |

The design uses 5 lines, above the exam minimum of 4. The extra Violet Line adds
shortcuts and line-change decisions without making the map too large.

## Interchange Stations

| Station | Lines | Gameplay reason |
| --- | --- | --- |
| Museum Square | Red, Green | Teaches early line changes. |
| Central Spire | Red, Blue, Violet | Main hub; useful for many start/destination pairs. |
| West Garden | Red, Gold | Connects Red to the right-side Gold loop. |
| Glassworks | Blue, Gold | Creates alternate Blue/Gold choices. |
| River Forum | Blue, Green | Connects lower Blue path to Green. |
| South Arena | Blue, Gold | Endpoint that is still an interchange. |
| Old Foundry | Green, Violet | Makes Violet useful as a shortcut line. |
| East Depot | Green, Gold | Creates route alternatives into the eastern side. |
| Clocktower | Gold, Violet | Lets players switch between shortcut and Gold routes. |

The exam requires at least 3 interchange stations. This network has 9. That is
intentional: the core route rule is about line changes at interchanges, so the
network needs enough interchanges to make that rule matter.

## Segment List

These are the direct station pairs shown during planning.

| Segment | Lines serving it |
| --- | --- |
| Aurora Gate - Museum Square | Red |
| Museum Square - Central Spire | Red |
| Central Spire - Harbor Market | Red |
| Harbor Market - West Garden | Red |
| North Library - Central Spire | Blue |
| Central Spire - Glassworks | Blue |
| Glassworks - River Forum | Blue |
| River Forum - South Arena | Blue |
| Museum Square - Old Foundry | Green |
| Old Foundry - River Forum | Green |
| River Forum - Hill Observatory | Green |
| Hill Observatory - East Depot | Green |
| West Garden - Clocktower | Gold |
| Clocktower - Glassworks | Gold |
| Glassworks - East Depot | Gold |
| East Depot - South Arena | Gold |
| Canal Court - Old Foundry | Violet |
| Old Foundry - Central Spire | Violet |
| Central Spire - Clocktower | Violet |

There are 19 unique segments. This is enough to make the planning list
scrollable and meaningful without becoming a search problem.

## Route Variety Examples

### Example 1: Aurora Gate to South Arena

Possible route:

```txt
Aurora Gate -> Museum Square -> Central Spire -> Glassworks -> River Forum -> South Arena
```

Lines:

```txt
Red -> Red -> Blue -> Blue -> Blue
```

Line change at Central Spire is valid because Central Spire is an interchange.

### Example 2: Canal Court to West Garden

Possible route:

```txt
Canal Court -> Old Foundry -> Central Spire -> Harbor Market -> West Garden
```

Lines:

```txt
Violet -> Violet -> Red -> Red
```

Line change at Central Spire is valid.

Alternative route:

```txt
Canal Court -> Old Foundry -> Central Spire -> Clocktower -> West Garden
```

Lines:

```txt
Violet -> Violet -> Violet -> Gold
```

Line change at Clocktower is valid.

### Example 3: North Library to East Depot

Possible route:

```txt
North Library -> Central Spire -> Glassworks -> East Depot
```

Lines:

```txt
Blue -> Blue -> Gold
```

Line change at Glassworks is valid. This is a compact route that demonstrates
why knowing interchanges improves score potential.

## Balance Notes

- Major hub: Central Spire appears on 3 lines, so it will often be part of valid
  routes. This helps players form a mental anchor.
- Secondary hubs: Glassworks, River Forum, Old Foundry, Clocktower, and East
  Depot create alternatives away from the main hub.
- Non-interchange stations such as Harbor Market and Hill Observatory are useful
  because they create places where line changes should not be allowed.
- Endpoint interchanges such as South Arena and East Depot create valid
  destinations that still teach line membership.

## Tuning Risks

| Risk | Mitigation |
| --- | --- |
| Too many interchanges make line-change rules feel too permissive. | Keep some middle stations non-interchange and test invalid line-change examples. |
| Central Spire becomes the obvious route for every pair. | Use random pairs across the lower and eastern network; consider max-distance or route-diversity selection later. |
| Planning list is hard to scan. | Group segments by station or sort alphabetically, but do not reveal line names during planning. |
| Players forget endpoint stations. | Make endpoints visually clear in setup map labels. |

## Map Layout Guidance

The UI map should place the network roughly as a readable transit diagram:

- Red Line: upper horizontal path.
- Blue Line: central-to-lower diagonal path.
- Green Line: left-lower-to-right path.
- Gold Line: right-side connector path.
- Violet Line: short diagonal shortcut through the center.

Exact `x`/`y` coordinates belong in seed data, but the map should avoid label
overlap and keep Central Spire visually central.
