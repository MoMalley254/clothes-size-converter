const test = require("node:test");
const assert = require("node:assert/strict");

const {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions,
  mapSizeToUS,
} = require("../converters/trousers/convertTrouser");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

test("listAllData returns men and women trouser data", () => {
  const data = listAllData();
  assert.ok(data.men);
  assert.ok(data.women);
  assert.ok(data.men.Nike);
  assert.ok(data.women.Adidas);
});

test("listGenderData returns data for a known gender and null otherwise", () => {
  assert.equal(listGenderData("men"), listAllData().men);
  assert.equal(listGenderData("women"), listAllData().women);
  assert.equal(listGenderData("kids"), null);
});

test("listBrands returns brand names and an error string for unknown gender", () => {
  assert.deepEqual(listBrands("men").sort(), ["Adidas", "Nike"]);
  assert.deepEqual(listBrands("women").sort(), ["Adidas", "Nike"]);
  assert.equal(listBrands("kids"), "kids not found");
});

test("listSizesForBrand returns the brand chart", () => {
  const nikeMen = listSizesForBrand("men", "Nike");
  assert.equal(typeof nikeMen, "object");
  assert.ok(nikeMen.M);
  assert.deepEqual(nikeMen.M, {
    waist: [81, 89],
    hip: [96, 104],
    inseam: [80, 82],
  });
});

test("listSizesForBrand returns error strings for bad input", () => {
  assert.equal(listSizesForBrand("kids", "Nike"), "kids not found");
  assert.equal(listSizesForBrand("men", "Puma"), "Puma not found in the data");
});

test("listDimensionsForSize returns the size's measurements", () => {
  assert.deepEqual(listDimensionsForSize("men", "Adidas", "L"), {
    waist: [86, 94],
    hip: [97, 104],
    inseam: [80, 82],
  });
});

test("listDimensionsForSize returns an error string for an unknown size", () => {
  assert.equal(
    listDimensionsForSize("men", "Nike", "ZZ"),
    "ZZ not found in the Nike data",
  );
});

test("listDimensionsForSizeType returns one measurement or all", () => {
  assert.deepEqual(
    listDimensionsForSizeType("women", "Nike", "M", "waist"),
    [74, 81],
  );
  assert.deepEqual(listDimensionsForSizeType("women", "Nike", "M"), {
    waist: [74, 81],
    hip: [98, 105],
    inseam: [78, 80],
  });
});

test("listDimensionsForSizeType returns an error string for an unknown measurement", () => {
  assert.equal(
    listDimensionsForSizeType("men", "Nike", "M", "chest"),
    "chest not found in Nike, M data",
  );
});

test("listSizesFromDimensions matches inclusive boundaries", () => {
  // Nike men M waist is 81-89, so 81 and 89 should both match M (and possibly others)
  const result = listSizesFromDimensions("men", "Nike", [{ waist: 81 }]);
  assert.ok(result.some((entry) => entry.M));
  const resultMax = listSizesFromDimensions("men", "Nike", [{ waist: 89 }]);
  assert.ok(resultMax.some((entry) => entry.M));
});

test("listSizesFromDimensions combines multiple measurements", () => {
  const result = listSizesFromDimensions("men", "Adidas", [
    { waist: 83 },
    { hip: 94 },
  ]);
  assert.ok(result.some((entry) => entry.M));
});

test("listSizesFromDimensions returns [] when nothing matches", () => {
  assert.deepEqual(
    listSizesFromDimensions("men", "Nike", [{ waist: 999 }]),
    [],
  );
});

test("listSizesFromDimensions ignores unknown measurement keys", () => {
  assert.deepEqual(
    listSizesFromDimensions("men", "Nike", [{ chest: 100 }]),
    [],
  );
});

test("mapSizeToUS maps a trouser size to US sizes, best first", () => {
  const result = labels(mapSizeToUS("men", "Nike", "L"));
  assert.ok(result.length > 0);
  assert.ok(result.includes("L") || result.includes("XL"));
});

test("mapSizeToUS returns the US dimensions alongside each label", () => {
  const [match] = mapSizeToUS("men", "Nike", "L");
  const [usLabel] = Object.keys(match);
  assert.ok(match[usLabel].waist);
  assert.ok(match[usLabel].hip);
  assert.ok(match[usLabel].inseam);
});

test("mapSizeToUS sizeType restricts the comparison", () => {
  const all = labels(mapSizeToUS("men", "Nike", "L"));
  const waistOnly = labels(mapSizeToUS("men", "Nike", "L", "waist"));
  assert.ok(waistOnly.length >= all.length);
});

test("mapSizeToUS returns [] when nothing matches", () => {
  assert.deepEqual(mapSizeToUS("men", "Nike", "XS", "inseam"), []);  // 79-81 only touches 79-81 edge
});

test("mapSizeToUS returns error strings for bad input", () => {
  assert.equal(mapSizeToUS("kids", "Nike", "M"), "kids not found");
  assert.equal(mapSizeToUS("men", "Puma", "M"), "Puma not found in the data");
  assert.equal(mapSizeToUS("men", "Nike"), "No size provided");
  assert.equal(mapSizeToUS("men", "Nike", "M", "chest"), "chest not found in Nike, M data");
});
