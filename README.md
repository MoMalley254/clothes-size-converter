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
| Trousers | — | *(coming soon)* |
| Shoes | — | *(coming soon)* |
| Dresses | — | *(coming soon)* |

---

## Usage

```js
const {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions,
  mapSizeToUS,
} = require('./src/converters/shirts/convertShirt');
```

> **Note:** A top-level `index.js` entry point is on the roadmap. Until then, import directly from the converter file.

---

## API Reference — Shirts

All measurement values are in **centimetres (cm)** and represent `[min, max]` ranges.

---

### `listAllData()`

Returns the full dataset for all genders.

```js
listAllData();
// { men: { Nike: { ... }, Adidas: { ... } }, women: { ... } }
```

---

### `listGenderData(gender)`

Returns data for a specific gender.

| Param | Type | Values |
|-------|------|--------|
| `gender` | string | `"men"` \| `"women"` |

```js
listGenderData("men");
// { Nike: { XXS: { chest: [72, 80], ... }, ... }, Adidas: { ... } }
```

---

### `listBrands(gender)`

Returns an array of available brand names for a gender.

```js
listBrands("women");
// ["Adidas", "Nike"]
```

---

### `listSizesForBrand(gender, brand)`

Returns all sizes and their measurements for a brand.

```js
listSizesForBrand("men", "Nike");
// { XXS: { chest: [72, 80], waist: [57, 65], hip: [72, 80] }, XS: { ... }, ... }
```

---

### `listDimensionsForSize(gender, brand, size)`

Returns the measurement ranges for a specific size label.

```js
listDimensionsForSize("women", "Adidas", "M");
// { bust: [89, 94], waist: [73, 78], hip: [98, 103] }
```

---

### `listDimensionsForSizeType(gender, brand, size, sizeType?)`

Returns one specific measurement for a size, or all measurements if `sizeType` is omitted.

| Param | Type | Example |
|-------|------|---------|
| `sizeType` | string \| undefined | `"chest"`, `"waist"`, `"hip"`, `"bust"` |

```js
listDimensionsForSizeType("men", "Nike", "L", "chest");
// [104, 112]

listDimensionsForSizeType("men", "Nike", "L");
// { chest: [104, 112], waist: [89, 97], hip: [104, 112] }
```

---

### `listSizesFromDimensions(gender, brand, dimensionsArray)`

Finds all size labels where the provided measurements fall within range. Useful for converting body measurements into a size recommendation.

`dimensionsArray` is an array of `{ [measurementKey]: value }` objects.

```js
listSizesFromDimensions("men", "Nike", [
  { chest: 100 },
  { waist: 84 }
]);
// [{ M: { chest: [96, 104], waist: [81, 89], hip: [96, 104] } }]
```

---

## Size Labels

### `mapSizeToUS(gender, brand, size)`

Maps a brand's size label to the closest US letter size(s) by comparing the
brand's measurement window with a US reference window per dimension.

For each US size, the overlap length is summed across every measurement the
brand entry and the US entry share (`chest`/`waist`/`hip` for men,
`bust`/`waist`/`hip` for women), and the US size(s) with the largest total
overlap are returned. A brand chart that is wider than a US window therefore
maps to the US size its measurements sit in, rather than to every window it
touches. The result is a list because two sizes can tie — either an alias pair
(`"XXS"`/`"2XS"` share one window) or a brand window that straddles two US
windows evenly. Sizes outside every US window, unknown sizes, unknown genders
and a missing size each return a descriptive string instead.

```js
mapSizeToUS("men", "Nike", "S-Tall"); // ["S"]
mapSizeToUS("men", "Nike", "XXS");    // ["XXS", "2XS"]
mapSizeToUS("women", "Nike", "L");    // ["L"]
mapSizeToUS("men", "Nike", "4XL");    // "4XL (Nike, men) does not overlap any US size"
```

The US windows are approximate reference ranges in centimetres; brand charts
can be wider or offset from them.

---

## Data Notes

### Men's shirts
`XXS`, `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`, `4XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `XXL-Tall`, `3XL-Tall`, `4XL-Tall`

### Women's shirts
`2XS`, `XS`, `S`, `M`, `L`, `XL`, `2XL`  
Tall variants: `S-Tall`, `M-Tall`, `L-Tall`, `XL-Tall`, `2XL-Tall`

---

## Measurement Keys

| Key | Used in | Description |
|-----|---------|-------------|
| `chest` | Men's shirts | Chest circumference (cm) |
| `bust` | Women's shirts | Bust circumference (cm) |
| `waist` | All | Waist circumference (cm) |
| `hip` | All | Hip circumference (cm) |

---

## Roadmap

- [ ] Add top-level `index.js` entry point
- [ ] Populate men's and women's trouser data
- [ ] Add trouser converter (`convertTrouser.js`)
- [ ] Add more brands (H&M, Zara, Levi's)
- [ ] Shoe and dress converters
- [ ] TypeScript type definitions
- [ ] Full Jest test suite
- [ ] CI via GitHub Actions

See [PLAN.md](./PLAN.md) for the detailed completion roadmap.

---

## Contributing

Bug reports and pull requests welcome at [github.com/MoMalley254/clothes-size-converter](https://github.com/MoMalley254/clothes-size-converter/issues).

---

## License

ISC © Morris K. Njuguna
