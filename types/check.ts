// Type-level checks for index.d.ts. This file is compiled (`npm run test:types`)
// but never run, and is not published.
import { shirts, trousers, shoes, dresses } from "../index";
import type { Range, SizeMatch, ShoeSizeRow } from "../index";

// Lookups return their result or an error string, so callers must narrow.
const matches = shirts.mapSizeToUS("men", "Nike", "L");
if (typeof matches !== "string") {
  const first: SizeMatch | undefined = matches[0];
  void first;
}

// sizeType overloads: omitted -> all dimensions, given -> one range.
const all = shirts.listDimensionsForSizeType("men", "Nike", "L");
const chest = shirts.listDimensionsForSizeType("men", "Nike", "L", "chest");
if (typeof all !== "string") void all.chest;
if (typeof chest !== "string") {
  const range: Range = chest;
  void range;
}

trousers.listDimensionsForSizeType("men", "Nike", "L", "inseam");
dresses.listSizesFromDimensions("women", "H&M", [{ bust: 90 }, { waist: 74 }]);

shoes.listDimensionsForSizeType("men", "Nike", "42", "foot_length");
const converted: number | string = shoes.convertShoeSize("men", "US", 9, "EU");
const chart: ShoeSizeRow[] | string = shoes.listSizeChart("men");
void converted;
void chart;

// @ts-expect-error unknown gender
shirts.listBrands("kids");
// @ts-expect-error a trouser has no chest measurement
trousers.listDimensionsForSizeType("men", "Nike", "L", "chest");
// @ts-expect-error dresses have no inseam measurement
dresses.listDimensionsForSizeType("women", "Nike", "M", "inseam");
// @ts-expect-error unknown shoe size system
shoes.convertShoeSize("men", "FR", 9, "EU");
