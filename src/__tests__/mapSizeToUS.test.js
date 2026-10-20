const test = require("node:test");
const assert = require("node:assert/strict");

const { mapSizeToUS } = require("../converters/shirts/convertShirt");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

test("maps a brand size to US sizes, best match first", () => {
  // Nike men L: chest 104-112 is mostly inside US XL (107-112)
  assert.deepEqual(labels(mapSizeToUS("men", "Nike", "L")), ["XL", "L"]);
});

test("returns the US dimensions alongside each label", () => {
  const [match] = mapSizeToUS("women", "Adidas", "M");
  assert.deepEqual(match, {
    M: { bust: [91, 97], waist: [73, 79], hip: [96, 102] },
  });
});

test("works for women", () => {
  assert.deepEqual(labels(mapSizeToUS("women", "Nike", "XXL")), ["XXL", "3XL"]);
});

test("tall sizes map the same as their regular size", () => {
  assert.deepEqual(
    mapSizeToUS("men", "Nike", "S-Tall"),
    mapSizeToUS("men", "Nike", "S")
  );
});

test("sizeType restricts the comparison to one measurement", () => {
  const all = labels(mapSizeToUS("men", "Nike", "M"));
  const chestOnly = labels(mapSizeToUS("men", "Nike", "M", "chest"));
  assert.deepEqual(all, ["M", "L"]);
  assert.deepEqual(chestOnly, ["M", "L"]);
  // Waist only: Nike M waist 81-89 overlaps US M (81-86) and L (86-91)
  assert.deepEqual(labels(mapSizeToUS("men", "Nike", "M", "waist")), ["M", "L"]);
});

test("ranges that only touch at an edge do not match", () => {
  // Nike men XL chest starts at 112, exactly where US XL chest (107-112) ends
  const result = labels(mapSizeToUS("men", "Nike", "XL"));
  assert.ok(!result.includes("XL"));
  assert.ok(result.includes("XXL"));
});

test("returns an empty array when no US size matches", () => {
  // Nike men 4XL-Tall chest 143-154 is beyond the US chart (max 137)
  assert.deepEqual(mapSizeToUS("men", "Nike", "4XL-Tall"), []);
});

test("returns error strings for bad input", () => {
  assert.equal(mapSizeToUS("kids", "Nike", "M"), "kids not found");
  assert.equal(mapSizeToUS("men", "Puma", "M"), "Puma not found in the data");
  assert.equal(mapSizeToUS("men", "Nike", "ZZ"), "ZZ not found in the Nike data");
  assert.equal(mapSizeToUS("men", "Nike"), "No size provided");
  assert.equal(
    mapSizeToUS("men", "Nike", "M", "bust"),
    "bust not found in Nike, M data"
  );
});

test("does not write to the console", () => {
  const original = console.log;
  let called = false;
  console.log = () => {
    called = true;
  };
  try {
    mapSizeToUS("men", "Nike", "M");
  } finally {
    console.log = original;
  }
  assert.equal(called, false);
});
