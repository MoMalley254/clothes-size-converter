const test = require("node:test");
const assert = require("node:assert/strict");

const dresses = require("../converters/dresses/convertDress");
const shirts = require("../converters/shirts/convertShirt");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

test("dresses are women's only", () => {
  assert.equal(dresses.listGenderData("men"), null);
  assert.equal(dresses.listBrands("men"), "men not found");
  assert.deepEqual(dresses.listBrands("women").sort(), [
    "Adidas",
    "H&M",
    "Levi's",
    "Nike",
    "Zara",
  ]);
});

test("charts use bust, waist and hip, with no Tall variants", () => {
  const nike = dresses.listSizesForBrand("women", "Nike");
  assert.deepEqual(dresses.listDimensionsForSize("women", "Nike", "M"), nike.M);
  assert.deepEqual(Object.keys(nike.M), ["bust", "waist", "hip"]);
  for (const brand of dresses.listBrands("women")) {
    for (const size of Object.keys(dresses.listSizesForBrand("women", brand))) {
      assert.ok(!size.endsWith("-Tall"), `${brand} ${size}`);
    }
  }
});

test("dress measurements match the women's shirt chart for the same size", () => {
  assert.deepEqual(
    dresses.listDimensionsForSize("women", "H&M", "M"),
    shirts.listDimensionsForSize("women", "H&M", "M")
  );
});

test("listDimensionsForSizeType returns one range or all", () => {
  assert.deepEqual(
    dresses.listDimensionsForSizeType("women", "Adidas", "M", "bust"),
    [89, 94]
  );
  assert.deepEqual(dresses.listDimensionsForSizeType("women", "Adidas", "M"), {
    bust: [89, 94],
    waist: [73, 78],
    hip: [98, 103],
  });
});

test("listSizesFromDimensions finds dress sizes", () => {
  const result = dresses.listSizesFromDimensions("women", "Adidas", [
    { bust: 90 },
    { waist: 74 },
    { hip: 100 },
  ]);
  assert.deepEqual(labels(result), ["M"]);
  assert.deepEqual(dresses.listSizesFromDimensions("women", "Adidas", [{ bust: 300 }]), []);
});

test("mapSizeToUS maps a dress size to US sizes", () => {
  const result = dresses.mapSizeToUS("women", "Adidas", "M");
  assert.ok(labels(result).includes("M"));
  assert.deepEqual(
    dresses.mapSizeToUS("women", "Adidas", "M"),
    shirts.mapSizeToUS("women", "Adidas", "M")
  );
});

test("lookups return error strings for bad input", () => {
  assert.equal(dresses.listSizesForBrand("women", "Puma"), "Puma not found in the data");
  assert.equal(dresses.mapSizeToUS("men", "Nike", "M"), "men not found");
  assert.equal(dresses.mapSizeToUS("women", "Nike"), "No size provided");
  assert.equal(
    dresses.listDimensionsForSize("women", "Nike", "ZZ"),
    "ZZ not found in the Nike data"
  );
});
