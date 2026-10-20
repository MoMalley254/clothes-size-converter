const { test } = require("node:test");
const assert = require("node:assert");

const { mapSizeToUS } = require("../converters/shirts/convertShirt");

test("maps a brand size through the brand's own chart, including Tall variants", () => {
  assert.deepEqual(mapSizeToUS("men", "Nike", "S-Tall"), ["S"]);
  assert.deepEqual(mapSizeToUS("men", "Adidas", "M-Tall"), ["M"]);
  assert.deepEqual(mapSizeToUS("men", "Adidas", "S-Tall"), ["S"]);
});

test("returns both spellings of an alias pair", () => {
  assert.deepEqual(mapSizeToUS("men", "Nike", "XXS"), ["XXS", "2XS"]);
  assert.deepEqual(mapSizeToUS("women", "Nike", "XXL"), ["XXL", "2XL"]);
});

test("returns every tied size when a brand window straddles two US windows evenly", () => {
  assert.deepEqual(mapSizeToUS("men", "Nike", "XL"), [
    "XXL",
    "2XL",
    "XXXL",
    "3XL",
  ]);
});

test("maps women's sizes against the women's lookup", () => {
  assert.deepEqual(mapSizeToUS("women", "Adidas", "S"), ["S"]);
  assert.deepEqual(mapSizeToUS("women", "Nike", "L"), ["L"]);
  assert.deepEqual(mapSizeToUS("women", "Adidas", "XL"), ["L"]);
});

test("reports sizes with no overlapping US window", () => {
  assert.match(
    mapSizeToUS("men", "Nike", "4XL"),
    /does not overlap any US size/
  );
});

test("reports unknown brand sizes via the brand's own chart", () => {
  assert.match(
    mapSizeToUS("men", "Nike", "NOPE"),
    /NOPE not found in the Nike data/
  );
});

test("reports genders without a US lookup", () => {
  assert.strictEqual(
    mapSizeToUS("kids", "Nike", "S"),
    "kids not available in US lookup"
  );
});

test("requires a size", () => {
  assert.strictEqual(mapSizeToUS("men", "Nike"), "No size provided");
});
