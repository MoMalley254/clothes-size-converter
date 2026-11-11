const lookups = require("../converters/shared/lookups");

// A tiny chart, so these tests do not depend on the real brand data.
const data = {
  men: {
    Acme: {
      S: { chest: [80, 90], waist: [70, 80] },
      M: { chest: [90, 100], waist: [80, 90] },
      L: { chest: [100, 110] },
    },
  },
};
const usLookUp = {
  men: {
    S: { chest: [80, 88], waist: [70, 78] },
    M: { chest: [88, 98], waist: [80, 88] },
    L: { chest: [98, 108], waist: [88, 98] },
  },
};
const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

describe("shared lookups", () => {
  test("listAllData returns the data it was given", () => {
    expect(lookups.listAllData(data)).toBe(data);
  });

  test("listGenderData returns the gender or null", () => {
    expect(lookups.listGenderData(data, "men")).toBe(data.men);
    expect(lookups.listGenderData(data, "women")).toBeNull();
  });

  test("listBrands", () => {
    expect(lookups.listBrands(data, "men")).toEqual(["Acme"]);
    expect(lookups.listBrands(data, "women")).toBe("women not found");
  });

  test("listSizesForBrand", () => {
    expect(lookups.listSizesForBrand(data, "men", "Acme")).toBe(data.men.Acme);
    expect(lookups.listSizesForBrand(data, "women", "Acme")).toBe("women not found");
    expect(lookups.listSizesForBrand(data, "men", "Other")).toBe("Other not found in the data");
  });

  test("listDimensionsForSize", () => {
    expect(lookups.listDimensionsForSize(data, "men", "Acme", "S")).toBe(data.men.Acme.S);
    expect(lookups.listDimensionsForSize(data, "men", "Acme", "XL")).toBe(
      "XL not found in the Acme data"
    );
    // errors from the layer below are passed through unchanged
    expect(lookups.listDimensionsForSize(data, "men", "Other", "S")).toBe(
      "Other not found in the data"
    );
  });

  test("listDimensionsForSizeType", () => {
    expect(lookups.listDimensionsForSizeType(data, "men", "Acme", "S")).toBe(data.men.Acme.S);
    expect(lookups.listDimensionsForSizeType(data, "men", "Acme", "S", "chest")).toEqual([80, 90]);
    expect(lookups.listDimensionsForSizeType(data, "men", "Acme", "L", "waist")).toBe(
      "waist not found in Acme, L data"
    );
    expect(lookups.listDimensionsForSizeType(data, "men", "Acme", "XL", "chest")).toBe(
      "XL not found in the Acme data"
    );
  });

  describe("listSizesFromDimensions", () => {
    test("returns every size containing all the values", () => {
      // 90 is the top of S and the bottom of M, both inclusive
      expect(labels(lookups.listSizesFromDimensions(data, "men", "Acme", [{ chest: 90 }]))).toEqual([
        "S",
        "M",
      ]);
      expect(
        labels(lookups.listSizesFromDimensions(data, "men", "Acme", [{ chest: 95 }, { waist: 85 }]))
      ).toEqual(["M"]);
    });

    test("a size without the measurement never matches", () => {
      expect(lookups.listSizesFromDimensions(data, "men", "Acme", [{ waist: 85 }, { chest: 105 }])).toEqual([]);
    });

    test("returns an error string for an unknown brand", () => {
      expect(lookups.listSizesFromDimensions(data, "men", "Other", [{ chest: 90 }])).toBe(
        "Other not found in the data"
      );
    });
  });

  describe("mapSizeToUS", () => {
    test("ranks US sizes by how much of the brand range they cover", () => {
      // Acme M chest 90-100: US M (88-98) covers 8 of 10 cm, US L (98-108) only 2
      expect(labels(lookups.mapSizeToUS(usLookUp, data, "men", "Acme", "M", "chest"))).toEqual([
        "M",
        "L",
      ]);
    });

    test("requires every shared measurement to overlap", () => {
      // Acme S: chest 80-90 overlaps both US S and US M, but waist 70-80 only touches US M's 80 edge
      expect(labels(lookups.mapSizeToUS(usLookUp, data, "men", "Acme", "S"))).toEqual(["S"]);
    });

    test("only compares measurements the US chart has", () => {
      const noWaist = { men: { S: { chest: [80, 88] } } };
      expect(labels(lookups.mapSizeToUS(noWaist, data, "men", "Acme", "S"))).toEqual(["S"]);
    });

    test("returns [] when there is nothing to compare", () => {
      const unrelated = { men: { S: { hip: [80, 88] } } };
      expect(lookups.mapSizeToUS(unrelated, data, "men", "Acme", "S")).toEqual([]);
    });

    test("returns error strings", () => {
      expect(lookups.mapSizeToUS(usLookUp, data, "men", "Acme")).toBe("No size provided");
      expect(lookups.mapSizeToUS(usLookUp, data, "men", "Acme", "XL")).toBe(
        "XL not found in the Acme data"
      );
      expect(lookups.mapSizeToUS({}, data, "men", "Acme", "S")).toBe(
        "men not available in US lookup"
      );
    });
  });
});
