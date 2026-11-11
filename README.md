# clothes-size-converter

[![CI](https://github.com/MoMalley254/clothes-size-converter/actions/workflows/ci.yml/badge.svg)](https://github.com/MoMalley254/clothes-size-converter/actions/workflows/ci.yml)

A Node.js package for looking up and converting clothing sizes across brands and regions (EU, UK, US, Asia and more).

**Author:** Morris K. Njuguna  
**License:** ISC

---

## Installation

```bash
npm install clothes-size-converter
```

---

## Current Coverage

| Garment | Genders | Brands |
|---------|---------|--------|
| Shirts / Tops | Men | Nike, Adidas, Zara, Levi's |
| Shirts / Tops | Women | Nike, Adidas, H&M, Zara, Levi's |
| Trousers | Men | Nike, Adidas, Zara, Levi's |
| Trousers | Women | Nike, Adidas, H&M, Zara, Levi's |
| Shoes | Men, Women | Nike |
| Dresses | Women | Nike, Adidas, H&M, Zara, Levi's |

---

## Usage

```js
const { shirts, trousers, shoes, dresses } = require('clothes-size-converter');

shirts.listBrands('men');
trousers.listSizesForBrand('women', 'Nike');
shirts.listSizesForBrand('men', 'Nike');
trousers.listSizesForBrand('men', 'Nike');
shirts.mapSizeToUS('men', 'Nike', 'L');
trousers.mapSizeToUS('men', 'Nike', 'L');
dresses.mapSizeToUS('women', 'H&M', 'M');
shoes.convertShoeSize('men', 'US', 9, 'EU'); // 42.5
```

---

## TypeScript

Type definitions ship with the package (`index.d.ts`); no `@types` install needed.

```ts
import { shirts } from 'clothes-size-converter';

const result = shirts.mapSizeToUS('men', 'Nike', 'L');

// Lookups return an error message string when something is not found,
// so narrow before using the result:
if (typeof result !== 'string') {
  console.log(result[0]);
}
```

---

## API Reference — Shirts, Trousers, Dresses, Shoes

All measurement values are in **centimetres (cm)** and represent `[min, max]` ranges.

---

### `listAllData()`

Returns the full dataset for all genders.

```js
shirts.listAllData();
trousers.listAllData();
// { men: { Nike: { ... }, Adidas: { ... } }, women: { ... } }
```

---

### `listGenderData(gender)`

Returns data for a specific gender.

| Param | Type | Values |
|-------|------|--------|
| `gender` | string | `"men"` \| `"women"` |

```js
shirts.listGenderData("men");
trousers.listGenderData("men");
// { Nike: { XXS: { chest: [72, 80], ... }, ... }, Adidas: { ... } }
//Trousers will not have chest etc, see src/data/[men/women]/trousers.json
```

---

### `listBrands(gender)`

Returns an array of available brand names for a gender.

```js
shirts.listBrands("women");
trousers.listBrands("women");
// ["Adidas", "Nike", "H&M", "Zara", "Levi's"]
```

---

### `listSizesForBrand(gender, brand)`

Returns all sizes and their measurements for a brand.

```js
shirts.listSizesForBrand("men", "Nike");
trousers.listSizesForBrand("men", "Nike");
// { XXS: { chest: [72, 80], waist: [57, 65], hip: [72, 80] }, XS: { ... }, ... }
//Trousers will not have chest etc, see src/data/[men/women]/trousers.json
```

---

### `listDimensionsForSize(gender, brand, size)`

Returns the measurement ranges for a specific size label.

```js
shirts.listDimensionsForSize("women", "Adidas", "M");
trousers.listDimensionsForSize("women", "Adidas", "M");
// { bust: [89, 94], waist: [73, 78], hip: [98, 103] }
//Trousers will not have bust etc, see src/data/[men/women]/trousers.json
```

---

### `listDimensionsForSizeType(gender, brand, size, sizeType?)`

Returns one specific measurement for a size, or all measurements if `sizeType` is omitted.

| Param | Type | Example |
|-------|------|---------|
| `sizeType` | string \| undefined | `"chest"`, `"waist"`, `"hip"`, `"bust"`, `"inseam"` |

```js
shirts.listDimensionsForSizeType("men", "Nike", "L", "chest");
// [104, 112]
trousers.listDimensionsForSizeType("men", "Nike", "L", "hip");
// [104, 112]

shirts.listDimensionsForSizeType("men", "Nike", "L");
// { chest: [104, 112], waist: [89, 97], hip: [104, 112] }
trousers.listDimensionsForSizeType("men", "Nike", "L");
// { waist: [89, 97], hip: [104, 112], inseam: [80, 82] }
```

---

### `listSizesFromDimensions(gender, brand, dimensionsArray)`

Finds all size labels where the provided measurements fall within range. Useful for converting body measurements into a size recommendation.

`dimensionsArray` is an array of `{ [measurementKey]: value }` objects.

```js
shirts.listSizesFromDimensions("men", "Nike", [
  { chest: 100 },
  { waist: 84 }
]);
// [{ M: { chest: [96, 104], waist: [81, 89], hip: [96, 104] } }]
```

---

### `mapSizeToUS(gender, brand, size, sizeType?)`

Maps a brand's size to the matching US size(s). A US size matches when every measurement the two charts share overlaps (ranges that only touch at an edge don't count). Results are ordered best match first.

| Param | Type | Notes |
|-------|------|-------|
| `size` | string | The brand's size label, e.g. `"M"` or `"L-Tall"` |
| `sizeType` | string \| undefined | Optional. Compare only this measurement, e.g. `"chest"` |

Returns an array of `{ [usSize]: dimensions }`, an empty array if no US size matches, or an error string if the gender, brand or size isn't found.

```js
shirts.mapSizeToUS("men", "Nike", "L");
// [
//   { XL: { chest: [107, 112], waist: [91, 97], hip: [106, 111] } },
//   { L:  { chest: [102, 107], waist: [86, 91], hip: [101, 106] } }
// ]
```

> **Note:** The US reference charts are in `convertShirt.js`. The women's chart is a first pass and the men's chart has a gap between XS and S; both should be verified against a source chart.

---

## Shoes

Shoes share the lookup functions above (`listBrands`, `listSizesForBrand`, `listSizesFromDimensions`, `mapSizeToUS`, ...) with one difference: brand charts are keyed by **EU size** (e.g. `"42.5"`) and hold a single measurement, `foot_length` in cm.

```js
shoes.listDimensionsForSize("men", "Nike", "42");
// { foot_length: [26.25, 26.75] }

shoes.listSizesFromDimensions("men", "Nike", [{ foot_length: 26.5 }]);
// [{ "42": { foot_length: [26.25, 26.75] } }]

shoes.mapSizeToUS("men", "Nike", "42");
// [{ "9": ... }, { "9.5": ... }, { "8.5": ... }]  best match first
```

### `convertShoeSize(gender, from, size, to)`

Converts between the `"EU"`, `"UK"`, `"US"` and `"Asia"` systems (names are case-insensitive). Asia is the CM/JP size, i.e. foot length in cm. Returns the converted size as a number, or an error string.

```js
shoes.convertShoeSize("men", "US", 9, "EU");     // 42.5
shoes.convertShoeSize("women", "UK", 4.5, "US"); // 7
shoes.convertShoeSize("men", "US", 20, "EU");    // "20 not found in US sizes for men"
```

### `listSizeChart(gender)`

Returns every size in all four systems.

```js
shoes.listSizeChart("men")[0];
// { EU: 38.5, UK: 5, US: 6, Asia: 24 }
```

---

## Dresses

Dresses are **women's only** and use `bust`, `waist` and `hip`. They have the same functions as shirts; `dresses.listGenderData("men")` returns `null`.

```js
dresses.listBrands("women");
// ["Adidas", "Nike", "H&M", "Zara", "Levi's"]
dresses.listSizesFromDimensions("women", "Adidas", [{ bust: 90 }, { waist: 74 }, { hip: 100 }]);
// [{ M: { bust: [89, 94], waist: [73, 78], hip: [98, 103] } }]
```

---

## Size Labels

### Men's shirts
`XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`, `4XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `XXL-Tall`, `3XL-Tall`, `4XL-Tall`

### Women's shirts
`2XS`, `XS`, `S`, `M`, `L`, `XL`, `2XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `2XL-Tall`

### Men's trousers
`XS`, `S`, `M`, `L`, `XL`, `XXL` (Nike); `XS`, `S`, `M`, `L`, `XL`, `2XL` (Adidas); `S`, `M`, `L`, `XL` (Zara); `30`, `32`, `34`, `36`, `38` (Levi's, waist in inches)

### Women's trousers
`XS`, `S`, `M`, `L`, `XL`, `XXL` (Nike); `XS`, `S`, `M`, `L`, `XL`, `2XL` (Adidas); `XS`–`3XL` (H&M); `XS`–`XL` (Zara); `XXS`–`XL` (Levi's)

### Dresses
Same labels as women's shirts, without the Tall variants.

### Shoes
Brand charts use EU sizes: `38.5`–`47.5` (men), `35.5`–`43` (women), in half sizes.

### Other brands (shirts)
- Men: `S`–`XL` (Zara), `XS`–`XL` (Levi's)
- Women: `XS`–`3XL` (H&M), `XS`–`XL` (Zara), `XXS`–`XL` (Levi's)

---

## Data Notes

Not every brand publishes every measurement, so some charts have fewer keys than others
(`mapSizeToUS` only compares the measurements both charts share).

- **Zara** men's shirts have `chest` only; men's trousers have `waist` only.
- **Levi's** men's shirts have `chest` and `waist` only. Men's trousers use jeans sizes
  (waist in inches); `inseam` is `[76, 86]`, the range of lengths 30–34 in, because length is
  chosen separately from waist.
- **Levi's** and **Zara** women's charts publish a single body measurement per size, so the
  `[min, max]` ranges were derived from the midpoints between neighbouring sizes.
- Levi's men's trouser sizes 30 and 32 were extrapolated from the published 34/36/38 rows.
- **H&M** men's charts are not included yet.
- **Dresses** reuse the body measurements from each brand's women's shirt chart (the
  same size guide applies); the US dress chart is the generic US women's alpha chart.
- **Shoes**: only Nike is included. Its foot lengths are the published CM sizes ±0.25 cm.
  The US reference chart assumes one US size is 1/3 inch (0.847 cm), anchored at 24.8 cm
  for men's size 7 with women's sizes 1.5 higher, so `mapSizeToUS` can differ by a size or
  so from a brand's own US label. UK is derived from US (men: US − 1, women: US − 2.5).

These come from brand size guides and third-party aggregators and should be verified against
the brands' own charts before relying on them.


---

## Measurement Keys

| Key | Used in | Description |
|-----|---------|-------------|
| `chest` | Men's shirts | Chest circumference (cm) |
| `bust` | Women's shirts | Bust circumference (cm) |
| `waist` | All | Waist circumference (cm) |
| `hip` | All | Hip circumference (cm) |
| `inseam` | Trousers | Inside-leg length (cm) |
| `foot_length` | Shoes | Foot length (cm) |

---

## Roadmap

- [x] Fix and re-enable `mapSizeToUS()` for cross-region conversion
- [x] Add top-level `index.js` entry point
- [x] Populate men's and women's trouser data
- [x] Add trouser converter (`convertTrouser.js`)
- [ ] Add more brands (H&M, Zara, Levi's) — H&M men's still to do
- [x] Shoe and dress converters
- [x] TypeScript type definitions
- [x] Full Jest test suite
- [x] CI via GitHub Actions

See [PLAN.md](./PLAN.md) for the detailed completion roadmap.

---

## Testing

Tests use [Jest](https://jestjs.io) and live in `src/__tests__/`.

```bash
npm install
npm test                # run the suite
npm run test:coverage   # also print coverage and enforce the thresholds
```

- Converter tests (`shirt`, `trouser`, `dress`, `shoe`, `mapSizeToUS`) check each public function, including its error strings.
- `lookups.test.js` tests the shared lookup module against a tiny fixture chart, so it does not depend on brand data.
- `data.test.js` validates every JSON chart: `[min, max]` ranges in cm, allowed measurement keys per garment, and sizes ordered smallest to largest.
- `index.test.js` checks that every garment is exported with the same API.

Coverage thresholds (95% statements, lines and functions, 90% branches) are set in the `jest` block of `package.json`.

`npm run test:types` type-checks `index.d.ts` against `types/check.ts`, including `@ts-expect-error` lines that must keep failing to compile.

### Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request:

- **Test**: `npm ci` then `npm run test:coverage` on Node 18, 20, 22 and 24. The coverage report from the Node 22 run is uploaded as a build artifact.
- **Type definitions**: `npm run test:types`.
- **CI passed**: a single summary check. Require this one in branch protection (Settings → Branches) so the Node matrix can change without editing the rule.

---

## Contributing

Bug reports and pull requests welcome at [github.com/MoMalley254/clothes-size-converter](https://github.com/MoMalley254/clothes-size-converter/issues).

---

## License

ISC © Morris K. Njuguna