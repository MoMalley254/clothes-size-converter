# clothes-size-converter

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
| Shirts / Tops | Men, Women | Nike, Adidas |
| Trousers | Men, Women | Nike, Adidas |
| Shoes | — | *(coming soon)* |
| Dresses | — | *(coming soon)* |

---

## Usage

```js
const { shirts, trousers } = require('clothes-size-converter');

shirts.listBrands('men');
trousers.listSizesForBrand('women', 'Nike');
shirts.listSizesForBrand('men', 'Nike');
trousers.listSizesForBrand('men', 'Nike');
shirts.mapSizeToUS('men', 'Nike', 'L');
trousers.mapSizeToUS('men', 'Nike', 'L');
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

## API Reference — Shirts, Trousers

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
// ["Adidas", "Nike"]
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

## Size Labels

### Men's shirts
`XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`, `4XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `XXL-Tall`, `3XL-Tall`, `4XL-Tall`

### Women's shirts
`2XS`, `XS`, `S`, `M`, `L`, `XL`, `2XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `2XL-Tall`

### Men's trousers
`XS`, `S`, `M`, `L`, `XL`, `XXL` (Nike); `XS`, `S`, `M`, `L`, `XL`, `2XL` (Adidas)

### Women's trousers
`XS`, `S`, `M`, `L`, `XL`, `XXL` (Nike); `XS`, `S`, `M`, `L`, `XL`, `2XL` (Adidas)


---

## Measurement Keys

| Key | Used in | Description |
|-----|---------|-------------|
| `chest` | Men's shirts | Chest circumference (cm) |
| `bust` | Women's shirts | Bust circumference (cm) |
| `waist` | All | Waist circumference (cm) |
| `hip` | All | Hip circumference (cm) |
| `inseam` | Trousers | Inside-leg length (cm) |

---

## Roadmap

- [x] Fix and re-enable `mapSizeToUS()` for cross-region conversion
- [x] Add top-level `index.js` entry point
- [x] Populate men's and women's trouser data
- [x] Add trouser converter (`convertTrouser.js`)
- [ ] Add more brands (H&M, Zara, Levi's)
- [ ] Shoe and dress converters
- [x] TypeScript type definitions
- [ ] Full Jest test suite
- [ ] CI via GitHub Actions

See [PLAN.md](./PLAN.md) for the detailed completion roadmap.

---

## Contributing

Bug reports and pull requests welcome at [github.com/MoMalley254/clothes-size-converter](https://github.com/MoMalley254/clothes-size-converter/issues).

---

## License

ISC © Morris K. Njuguna