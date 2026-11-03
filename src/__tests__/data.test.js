const test = require("node:test");
const assert = require("node:assert/strict");

const dataFiles = {
  "men/shirts": require("../data/men/shirts.json"),
  "men/trousers": require("../data/men/trousers.json"),
  "women/shirts": require("../data/women/shirts.json"),
  "women/trousers": require("../data/women/trousers.json"),
};

test("all data files parse as valid JSON", () => {
  for (const [name, data] of Object.entries(dataFiles)) {
    assert.equal(typeof data, "object", `${name} should export an object`);
    assert.ok(!Array.isArray(data), `${name} should not be an array`);
  }
});

test("every size range is [min, max] with min <= max", () => {
  for (const [fileName, data] of Object.entries(dataFiles)) {
    for (const [brand, sizes] of Object.entries(data)) {
      for (const [size, dimensions] of Object.entries(sizes)) {
        for (const [key, range] of Object.entries(dimensions)) {
          const label = `${fileName} → ${brand} → ${size} → ${key}`;
          assert.ok(Array.isArray(range), `${label} should be an array`);
          assert.equal(range.length, 2, `${label} should have two values`);
          const [min, max] = range;
          assert.equal(typeof min, "number", `${label} min should be a number`);
          assert.equal(typeof max, "number", `${label} max should be a number`);
          assert.ok(min <= max, `${label} should have min <= max (${min} > ${max})`);
        }
      }
    }
  }
});