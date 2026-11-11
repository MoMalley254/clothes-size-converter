const dataFiles = {
  "men/shirts": require("../data/men/shirts.json"),
  "men/trousers": require("../data/men/trousers.json"),
  "women/shirts": require("../data/women/shirts.json"),
  "women/trousers": require("../data/women/trousers.json"),
  "women/dresses": require("../data/women/dresses.json"),
  "men/shoes": require("../data/men/shoes.json"),
  "women/shoes": require("../data/women/shoes.json"),
};

// Which measurements each chart may contain.
const allowedKeys = {
  "men/shirts": ["chest", "waist", "hip"],
  "men/trousers": ["waist", "hip", "inseam"],
  "women/shirts": ["bust", "waist", "hip"],
  "women/trousers": ["waist", "hip", "inseam"],
  "women/dresses": ["bust", "waist", "hip"],
  "men/shoes": ["foot_length"],
  "women/shoes": ["foot_length"],
};

// Every [file, brand, size, measurement, range] in the dataset.
const entries = [];
for (const [file, data] of Object.entries(dataFiles)) {
  for (const [brand, sizes] of Object.entries(data)) {
    for (const [size, dimensions] of Object.entries(sizes)) {
      for (const [key, range] of Object.entries(dimensions)) {
        entries.push([`${file} → ${brand} → ${size} → ${key}`, file, key, range]);
      }
    }
  }
}

describe("data files", () => {
  test("every file has an allowed-measurements entry", () => {
    expect(Object.keys(allowedKeys).sort()).toEqual(Object.keys(dataFiles).sort());
  });

  test.each(Object.keys(dataFiles))("%s parses as an object of brands", (file) => {
    const data = dataFiles[file];
    expect(typeof data).toBe("object");
    expect(Array.isArray(data)).toBe(false);
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  test.each(entries)("%s is a [min, max] range of numbers", (_label, _file, _key, range) => {
    expect(Array.isArray(range)).toBe(true);
    expect(range).toHaveLength(2);
    expect(typeof range[0]).toBe("number");
    expect(typeof range[1]).toBe("number");
  });

  // A zero-width range ([81, 81]) can never overlap anything in mapSizeToUS.
  test.each(entries)("%s is positive, non-degenerate and in cm", (_label, _file, _key, [min, max]) => {
    expect(min).toBeGreaterThan(0);
    expect(min).toBeLessThan(max);
    expect(max).toBeLessThan(300);
  });

  test.each(entries)("%s is a measurement valid for its chart", (_label, file, key) => {
    expect(allowedKeys[file]).toContain(key);
  });

  test.each(Object.keys(dataFiles))("%s has no size without measurements", (file) => {
    const empty = [];
    for (const [brand, sizes] of Object.entries(dataFiles[file])) {
      for (const [size, dimensions] of Object.entries(sizes)) {
        if (Object.keys(dimensions).length === 0) empty.push(`${brand} ${size}`);
      }
    }
    expect(empty).toEqual([]);
  });

  test("H&M, Zara and Levi's are covered (issue #5)", () => {
    const expected = {
      "men/shirts": ["H&M", "Zara", "Levi's"],
      "men/trousers": ["H&M", "Zara", "Levi's"],
      "women/shirts": ["H&M", "Zara", "Levi's"],
      "women/trousers": ["H&M", "Zara", "Levi's"],
    };
    for (const [file, brands] of Object.entries(expected)) {
      for (const brand of brands) {
        expect(dataFiles[file][brand]).toBeDefined();
      }
    }
  });

  // Skips -Tall variants (same ranges as regular) and numeric labels (checked via waist).
  test.each(Object.keys(dataFiles))("%s: sizes within a brand run smallest to largest", (file) => {
    for (const sizes of Object.values(dataFiles[file])) {
      const key = ["chest", "bust", "waist"].find((k) =>
        Object.values(sizes).every((d) => d[k])
      );
      if (!key) continue;
      const regular = Object.entries(sizes).filter(([s]) => !s.endsWith("-Tall"));
      for (let i = 1; i < regular.length; i++) {
        const [, prev] = regular[i - 1];
        const [, cur] = regular[i];
        expect(cur[key][0]).toBeGreaterThanOrEqual(prev[key][0]);
        expect(cur[key][1]).toBeGreaterThanOrEqual(prev[key][1]);
      }
    }
  });

  test("shoe ranges run smallest to largest and do not overlap", () => {
    for (const file of ["men/shoes", "women/shoes"]) {
      const ranges = Object.values(dataFiles[file].Nike)
        .map((d) => d.foot_length)
        .sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < ranges.length; i++) {
        expect(ranges[i][0]).toBeGreaterThanOrEqual(ranges[i - 1][1]);
      }
    }
  });
});
