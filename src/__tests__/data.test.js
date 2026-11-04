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
// Which measurements each garment chart may contain.
const allowedKeys = {
  "men/shirts": ["chest", "waist", "hip"],
  "men/trousers": ["waist", "hip", "inseam"],
  "women/shirts": ["bust", "waist", "hip"],
  "women/trousers": ["waist", "hip", "inseam"],
};

test("every size only uses measurements valid for its garment and gender", () => {
  for (const [fileName, data] of Object.entries(dataFiles)) {
    for (const [brand, sizes] of Object.entries(data)) {
      for (const [size, dimensions] of Object.entries(sizes)) {
        const keys = Object.keys(dimensions);
        assert.ok(keys.length > 0, `${fileName} → ${brand} → ${size} has no measurements`);
        for (const key of keys) {
          assert.ok(
            allowedKeys[fileName].includes(key),
            `${fileName} → ${brand} → ${size} has unexpected measurement "${key}"`
          );
        }
      }
    }
  }
});

test("ranges are positive, non-degenerate centimetre values", () => {
  // A zero-width range ([81, 81]) can never overlap anything in mapSizeToUS.
  for (const [fileName, data] of Object.entries(dataFiles)) {
    for (const [brand, sizes] of Object.entries(data)) {
      for (const [size, dimensions] of Object.entries(sizes)) {
        for (const [key, [min, max]] of Object.entries(dimensions)) {
          const label = `${fileName} → ${brand} → ${size} → ${key}`;
          assert.ok(min > 0, `${label} should be positive`);
          assert.ok(min < max, `${label} should have min < max`);
          assert.ok(max < 300, `${label} looks like it is not in cm`);
        }
      }
    }
  }
});

test("H&M, Zara and Levi's are covered (issue #5)", () => {
  const expected = {
    "men/shirts": ["Zara", "Levi's"],
    "men/trousers": ["Zara", "Levi's"],
    "women/shirts": ["H&M", "Zara", "Levi's"],
    "women/trousers": ["H&M", "Zara", "Levi's"],
  };
  for (const [fileName, brands] of Object.entries(expected)) {
    for (const brand of brands) {
      assert.ok(dataFiles[fileName][brand], `${fileName} should include ${brand}`);
    }
  }
});

test("sizes within a brand are ordered from smallest to largest", () => {
  // Skips -Tall variants (same ranges as regular) and numeric labels (checked via waist).
  for (const [fileName, data] of Object.entries(dataFiles)) {
    for (const [brand, sizes] of Object.entries(data)) {
      const key = ["chest", "bust", "waist"].find((k) =>
        Object.values(sizes).every((d) => d[k])
      );
      if (!key) continue;
      const regular = Object.entries(sizes).filter(([s]) => !s.endsWith("-Tall"));
      for (let i = 1; i < regular.length; i++) {
        const [prevSize, prev] = regular[i - 1];
        const [size, cur] = regular[i];
        assert.ok(
          cur[key][0] >= prev[key][0] && cur[key][1] >= prev[key][1],
          `${fileName} → ${brand}: ${size} ${key} should not be smaller than ${prevSize}`
        );
      }
    }
  }
});
