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
  listSizeChart,
  convertShoeSize,
} = require("../converters/shoes/convertShoe");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

test("listAllData / listGenderData / listBrands", () => {
  assert.ok(listAllData().men.Nike);
  assert.ok(listAllData().women.Nike);
  assert.equal(listGenderData("men"), listAllData().men);
  assert.equal(listGenderData("kids"), null);
  assert.deepEqual(listBrands("men"), ["Nike"]);
  assert.equal(listBrands("kids"), "kids not found");
});

test("brand charts are keyed by EU size and hold foot_length in cm", () => {
  assert.deepEqual(listDimensionsForSize("men", "Nike", "42"), {
    foot_length: [26.25, 26.75],
  });
  assert.deepEqual(listDimensionsForSizeType("women", "Nike", "38", "foot_length"), [
    23.75, 24.25,
  ]);
  assert.equal(typeof listSizesForBrand("men", "Nike"), "object");
});

test("lookup errors are error strings", () => {
  assert.equal(listSizesForBrand("men", "Puma"), "Puma not found in the data");
  assert.equal(listDimensionsForSize("men", "Nike", "99"), "99 not found in the Nike data");
  assert.equal(
    listDimensionsForSizeType("men", "Nike", "42", "chest"),
    "chest not found in Nike, 42 data"
  );
});

test("listSizesFromDimensions finds sizes by foot length", () => {
  assert.deepEqual(labels(listSizesFromDimensions("men", "Nike", [{ foot_length: 26.5 }])), ["42"]);
  assert.deepEqual(listSizesFromDimensions("men", "Nike", [{ foot_length: 50 }]), []);
});

test("mapSizeToUS maps a brand size to US sizes, best first", () => {
  const result = mapSizeToUS("men", "Nike", "42");
  assert.equal(labels(result)[0], "9");
  assert.ok(result[0]["9"].foot_length);
  assert.deepEqual(mapSizeToUS("women", "Nike", "38").length > 0, true);
});

test("mapSizeToUS returns [] / error strings", () => {
  assert.equal(mapSizeToUS("men", "Nike"), "No size provided");
  assert.equal(mapSizeToUS("kids", "Nike", "42"), "kids not found");
  assert.equal(mapSizeToUS("men", "Nike", "99"), "99 not found in the Nike data");
});

test("convertShoeSize converts between every system", () => {
  assert.equal(convertShoeSize("men", "US", 9, "EU"), 42.5);
  assert.equal(convertShoeSize("men", "US", 9, "UK"), 8);
  assert.equal(convertShoeSize("men", "US", 9, "Asia"), 27);
  assert.equal(convertShoeSize("men", "EU", 42.5, "US"), 9);
  assert.equal(convertShoeSize("women", "UK", 4.5, "US"), 7);
  assert.equal(convertShoeSize("women", "Asia", 25, "EU"), 39);
});

test("convertShoeSize accepts strings and any letter case", () => {
  assert.equal(convertShoeSize("men", "us", "9", "eu"), 42.5);
  assert.equal(convertShoeSize("men", "EU", "42.5", "UK"), 8);
});

test("convertShoeSize is reversible for every size in the chart", () => {
  for (const gender of ["men", "women"]) {
    for (const row of listSizeChart(gender)) {
      for (const from of ["EU", "UK", "US", "Asia"]) {
        for (const to of ["EU", "UK", "US", "Asia"]) {
          assert.equal(
            convertShoeSize(gender, to, convertShoeSize(gender, from, row[from], to), from),
            row[from]
          );
        }
      }
    }
  }
});

test("convertShoeSize returns error strings for bad input", () => {
  assert.equal(convertShoeSize("kids", "US", 9, "EU"), "kids not found");
  assert.equal(convertShoeSize("men", "US", undefined, "EU"), "No size provided");
  assert.equal(
    convertShoeSize("men", "FR", 9, "EU"),
    "FR is not a supported size system (EU, UK, US, Asia)"
  );
  assert.equal(
    convertShoeSize("men", "US", 9, "FR"),
    "FR is not a supported size system (EU, UK, US, Asia)"
  );
  assert.equal(convertShoeSize("men", "US", 20, "EU"), "20 not found in US sizes for men");
});

test("listSizeChart returns one row per size, or an error string", () => {
  const chart = listSizeChart("men");
  assert.deepEqual(chart[0], { EU: 38.5, UK: 5, US: 6, Asia: 24 });
  assert.equal(listSizeChart("kids"), "kids not found");
});

test("the Asia size matches the Nike chart's foot length midpoint", () => {
  for (const gender of ["men", "women"]) {
    for (const row of listSizeChart(gender)) {
      const [min, max] = listDimensionsForSizeType(gender, "Nike", String(row.EU), "foot_length");
      assert.equal((min + max) / 2, row.Asia);
    }
  }
});
