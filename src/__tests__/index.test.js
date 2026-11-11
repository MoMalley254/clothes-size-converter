const test = require("node:test");
const assert = require("node:assert/strict");

const converters = require("../../index");

test("index exports every garment converter with the same API", () => {
  assert.deepEqual(Object.keys(converters).sort(), ["dresses", "shirts", "shoes", "trousers"]);
  const common = [
    "listAllData",
    "listGenderData",
    "listBrands",
    "listSizesForBrand",
    "listDimensionsForSize",
    "listDimensionsForSizeType",
    "listSizesFromDimensions",
    "mapSizeToUS",
  ];
  for (const [name, converter] of Object.entries(converters)) {
    for (const fn of common) {
      assert.equal(typeof converter[fn], "function", `${name}.${fn}`);
    }
  }
  assert.equal(typeof converters.shoes.convertShoeSize, "function");
  assert.equal(typeof converters.shoes.listSizeChart, "function");
});
