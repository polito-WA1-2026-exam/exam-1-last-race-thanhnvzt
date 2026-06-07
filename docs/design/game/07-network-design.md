# Network Design

The network is part of the game design, not only seed data. It controls memory
load, route variety, interchange decisions, and how often players face meaningful
line-change choices.

This project uses a simplified network based on the provided "Ha Noi Metro
System in 2030" image. It uses the real legend names for the seeded metro lines,
but it keeps only a compact set of endpoints and hubs so the game remains easy
to memorize during setup.

## Design Goals

- Satisfy the exam minimums: at least 4 lines, 12 stations, and 3 interchange
  stations.
- Use the real line names shown in the provided Hanoi map legend.
- Keep the seeded route for each line consistent with its real endpoints.
- Keep the network small enough to memorize during setup.
- Include at least one invalid line-change example for validation testing.

## Station List

| Station | Gameplay role |
| --- | --- |
| Noi Bai Airport | Northern endpoint of Line 2. |
| Phu Minh | Northern Line 2 station near the airport corridor. |
| Co Nhue | Northwestern endpoint of the simplified Line 8 route. |
| West Lake | Non-interchange crossing area for Line 2 and Line 8. |
| Cau Giay | Western transfer hub for Lines 2, 2A, 3, and 5. |
| Cat Linh | Transfer between Line 2A and Line 3. |
| Ha Noi Station | Central railway hub for Lines 1, 3, and 5. |
| Long Bien | Eastern river-crossing transfer for Lines 1, 5, and 8. |
| Yen Vien | Northeastern endpoint of Line 1. |
| Ngoc Hoi | Southern endpoint of Line 1. |
| Giap Bat | Southern Line 1 station. |
| Ha Dong | Southwestern endpoint for Lines 2 and 2A. |
| An Khanh | Western endpoint of Line 5. |
| Nhon | Western Line 3 station. |
| Troi | Western endpoint of the simplified Line 3 route. |
| Yen So | Southern/southeastern endpoint of Line 3. |
| Co Loa | Northeastern endpoint of Line 5. |
| Trau Quy | Eastern endpoint of Line 8. |

There are 18 stations. This is still much smaller than the real 2030 map, but
it includes the named endpoints needed for the selected lines.

## Line Configuration

| Line | Stations in order | Design purpose |
| --- | --- | --- |
| Line 1 (Ngoc Hoi - Yen Vien) | Ngoc Hoi -> Giap Bat -> Ha Noi Station -> Long Bien -> Yen Vien | North-south/east railway spine through the central station. |
| Line 2 (Ha Dong - Noi Bai) | Ha Dong -> Cau Giay -> West Lake -> Phu Minh -> Noi Bai Airport | Airport-to-Ha Dong corridor. |
| Line 2A (Cat Linh - Ha Dong) | Cat Linh -> Cau Giay -> Ha Dong | Short west corridor matching the real Cat Linh-Ha Dong line name. |
| Line 3 (Troi - Nhon - Yen So) | Troi -> Nhon -> Cau Giay -> Cat Linh -> Ha Noi Station -> Yen So | West-to-southeast urban corridor. |
| Line 5 (Co Loa - An Khanh) | Co Loa -> Long Bien -> Ha Noi Station -> Cau Giay -> An Khanh | Corrected Line 5 route using the real Co Loa-An Khanh endpoints. |
| Line 8 (Co Nhue - Trau Quy) | Co Nhue -> West Lake -> Long Bien -> Trau Quy | Northwest-to-east connector. |

The design uses 6 lines, above the exam minimum of 4. It intentionally omits the
full real map's additional stations, monorails, and route branches.

## Interchange Stations

| Station | Lines | Gameplay reason |
| --- | --- | --- |
| Cau Giay | Line 2, Line 2A, Line 3, Line 5 | Main western transfer hub. |
| Cat Linh | Line 2A, Line 3 | Central transfer around the real Cat Linh corridor. |
| Ha Noi Station | Line 1, Line 3, Line 5 | Main rail/metro transfer anchor. |
| Long Bien | Line 1, Line 5, Line 8 | Eastern river-crossing transfer. |
| Ha Dong | Line 2, Line 2A | Southwestern transfer/endpoint. |

The exam requires at least 3 interchange stations. This network explicitly marks
5 stations as interchange stations. West Lake is touched by both Line 2 and Line
8 in the simplified map, but it is intentionally not marked as an interchange,
giving the validator a concrete invalid line-change case.

## Segment List

These are the direct station pairs shown during planning.

| Segment | Lines serving it |
| --- | --- |
| Ngoc Hoi - Giap Bat | Line 1 |
| Giap Bat - Ha Noi Station | Line 1 |
| Ha Noi Station - Long Bien | Line 1, Line 5 |
| Long Bien - Yen Vien | Line 1 |
| Ha Dong - Cau Giay | Line 2, Line 2A |
| Cau Giay - West Lake | Line 2 |
| West Lake - Phu Minh | Line 2 |
| Phu Minh - Noi Bai Airport | Line 2 |
| Cat Linh - Cau Giay | Line 2A, Line 3 |
| Troi - Nhon | Line 3 |
| Nhon - Cau Giay | Line 3 |
| Cat Linh - Ha Noi Station | Line 3 |
| Ha Noi Station - Yen So | Line 3 |
| Co Loa - Long Bien | Line 5 |
| Ha Noi Station - Cau Giay | Line 5 |
| Cau Giay - An Khanh | Line 5 |
| Co Nhue - West Lake | Line 8 |
| West Lake - Long Bien | Line 8 |
| Long Bien - Trau Quy | Line 8 |

There are 19 unique segments. This is enough to make route planning meaningful
without making the station-only planning screen too large.

## Route Variety Examples

### Example 1: Troi to Yen Vien

```txt
Troi -> Nhon -> Cau Giay -> Cat Linh -> Ha Noi Station -> Long Bien -> Yen Vien
```

The route stays on Line 3 until Ha Noi Station, then changes to Line 1 at Ha Noi
Station. The line change is valid because Ha Noi Station is an interchange.

### Example 2: Noi Bai Airport to Ha Dong

```txt
Noi Bai Airport -> Phu Minh -> West Lake -> Cau Giay -> Ha Dong
```

This route stays on Line 2. West Lake is non-interchange, but no line change
happens there, so the route can still be valid.

### Example 3: Co Loa to An Khanh

```txt
Co Loa -> Long Bien -> Ha Noi Station -> Cau Giay -> An Khanh
```

This route stays on the corrected Line 5 and matches the real legend endpoint
name `Co Loa - An Khanh`.

### Invalid Non-Interchange Example

```txt
Noi Bai Airport -> Phu Minh -> West Lake -> Long Bien
```

This tries to change from Line 2 to Line 8 at West Lake. West Lake is not an
allowed interchange in the seed data, so the backend rejects the route with
`Route changes lines outside an interchange station.`

## Balance Notes

- Major hubs: Cau Giay, Ha Noi Station, and Long Bien appear on multiple useful
  paths, so they become mental anchors.
- West Lake remains useful as a memory challenge because it is a crossing but
  not an allowed interchange.
- Line 5 now has its own Co Loa-An Khanh identity instead of incorrectly acting
  as an Ngoc Hoi connector.
- Endpoint stations such as Noi Bai Airport, Ngoc Hoi, Yen Vien, An Khanh, Co
  Loa, and Trau Quy help the map look closer to the provided reference image.

## Map Layout Guidance

The UI map should place the simplified network roughly like the reference map:

- Line 1: vertical south-to-northeast spine from Ngoc Hoi to Yen Vien.
- Line 2: north airport corridor bending through West Lake and Cau Giay to Ha
  Dong.
- Line 2A: short Cat Linh-Ha Dong west corridor.
- Line 3: western Troi/Nhon corridor through Cau Giay and Ha Noi Station toward
  Yen So.
- Line 5: Co Loa in the northeast through Long Bien and Ha Noi Station toward
  An Khanh in the southwest/west.
- Line 8: Co Nhue/West Lake corridor to Long Bien and Trau Quy in the east.

Exact `x`/`y` coordinates belong in seed data, but the map should avoid label
overlap and keep Cau Giay, Ha Noi Station, Long Bien, and West Lake visually
recognizable.
