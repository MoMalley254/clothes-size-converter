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

describe("trousers", () => {
  test("listAllData returns men and women trouser data", () => {
    const data = listAllData();
    expect(data.men.Nike).toBeDefined();
    expect(data.women.Adidas).toBeDefined();
  });

  test("listGenderData returns data for a known gender and null otherwise", () => {
    expect(listGenderData("men")).toBe(listAllData().men);
    expect(listGenderData("women")).toBe(listAllData().women);
    expect(listGenderData("kids")).toBeNull();
  });

  test("listBrands returns brand names and an error string for an unknown gender", () => {
    expect([...listBrands("men")].sort()).toEqual([
      "Adidas",
      "H&M",
      "Levi's",
      "Nike",
      "Zara",
    ]);
    expect([...listBrands("women")].sort()).toEqual([
      "Adidas",
      "H&M",
      "Levi's",
      "Nike",
      "Zara",
    ]);
    expect(listBrands("kids")).toBe("kids not found");
  });

  test("listSizesForBrand returns the brand chart", () => {
    const nikeMen = listSizesForBrand("men", "Nike");
    expect(nikeMen.M).toEqual({ waist: [81, 89], hip: [96, 104], inseam: [80, 82] });
  });

  test("listSizesForBrand returns error strings for bad input", () => {
    expect(listSizesForBrand("kids", "Nike")).toBe("kids not found");
    expect(listSizesForBrand("men", "Puma")).toBe("Puma not found in the data");
  });

  test("listDimensionsForSize returns the size's measurements or an error string", () => {
    expect(listDimensionsForSize("men", "Adidas", "L")).toEqual({
      waist: [86, 94],
      hip: [97, 104],
      inseam: [80, 82],
    });
    expect(listDimensionsForSize("men", "Nike", "ZZ")).toBe("ZZ not found in the Nike data");
  });

  test("listDimensionsForSizeType returns one measurement or all", () => {
    expect(listDimensionsForSizeType("women", "Nike", "M", "waist")).toEqual([74, 81]);
    expect(listDimensionsForSizeType("women", "Nike", "M")).toEqual({
      waist: [74, 81],
      hip: [98, 105],
      inseam: [78, 80],
    });
    expect(listDimensionsForSizeType("men", "Nike", "M", "chest")).toBe(
      "chest not found in Nike, M data"
    );
  });

  describe("H&M men's chart (official size guide)", () => {
    test("each letter size spans two numbered sizes, in cm", () => {
      expect(listDimensionsForSize("men", "H&M", "M")).toEqual({
        waist: [82, 90],
        hip: [97.5, 103.5],
      });
      expect(listDimensionsForSize("men", "H&M", "XXL")).toEqual({
        waist: [107.5, 116.5],
        hip: [115.5, 121.5],
      });
    });

    test("has waist and low hip only, from XS to XXL", () => {
      const chart = listSizesForBrand("men", "H&M");
      expect(Object.keys(chart)).toEqual(["XS", "S", "M", "L", "XL", "XXL"]);
      for (const dimensions of Object.values(chart)) {
        expect(Object.keys(dimensions)).toEqual(["waist", "hip"]);
      }
    });

    test("neighbouring sizes meet edge to edge, with no gaps", () => {
      const sizes = Object.values(listSizesForBrand("men", "H&M"));
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i].waist[0]).toBe(sizes[i - 1].waist[1]);
        expect(sizes[i].hip[0]).toBe(sizes[i - 1].hip[1]);
      }
    });

    test("maps to US sizes using the measurements both charts share", () => {
      expect(labels(mapSizeToUS("men", "H&M", "M"))).toEqual(["M", "L"]);
      expect(labels(mapSizeToUS("men", "H&M", "XS"))).toEqual(["XS"]);
      // H&M XXL waist (107.5+) is beyond the US chart, which ends at 102
      expect(mapSizeToUS("men", "H&M", "XXL")).toEqual([]);
    });
  });

  describe("listSizesFromDimensions", () => {
    test("matches inclusive boundaries", () => {
      // Nike men M waist is 81-89
      expect(listSizesFromDimensions("men", "Nike", [{ waist: 81 }]).some((e) => e.M)).toBe(true);
      expect(listSizesFromDimensions("men", "Nike", [{ waist: 89 }]).some((e) => e.M)).toBe(true);
    });

    test("combines multiple measurements", () => {
      const result = listSizesFromDimensions("men", "Adidas", [{ waist: 83 }, { hip: 94 }]);
      expect(result.some((entry) => entry.M)).toBe(true);
    });

    test("returns [] when nothing matches", () => {
      expect(listSizesFromDimensions("men", "Nike", [{ waist: 999 }])).toEqual([]);
    });

    test("ignores unknown measurement keys", () => {
      expect(listSizesFromDimensions("men", "Nike", [{ chest: 100 }])).toEqual([]);
    });
  });

  describe("mapSizeToUS", () => {
    test("maps a trouser size to US sizes, best first", () => {
      const result = labels(mapSizeToUS("men", "Nike", "L"));
      expect(result.length).toBeGreaterThan(0);
      expect(result.includes("L") || result.includes("XL")).toBe(true);
    });

    test("returns the US dimensions alongside each label", () => {
      const [match] = mapSizeToUS("men", "Nike", "L");
      const [usLabel] = Object.keys(match);
      expect(match[usLabel]).toEqual(
        expect.objectContaining({
          waist: expect.any(Array),
          hip: expect.any(Array),
          inseam: expect.any(Array),
        })
      );
    });

    test("sizeType restricts the comparison", () => {
      const all = labels(mapSizeToUS("men", "Nike", "L"));
      const waistOnly = labels(mapSizeToUS("men", "Nike", "L", "waist"));
      expect(waistOnly.length).toBeGreaterThanOrEqual(all.length);
    });

    test("returns [] when nothing matches", () => {
      // inseam 79-81 only touches the US 79-81 edge
      expect(mapSizeToUS("men", "Nike", "XS", "inseam")).toEqual([]);
    });

    test("returns error strings for bad input", () => {
      expect(mapSizeToUS("kids", "Nike", "M")).toBe("kids not found");
      expect(mapSizeToUS("men", "Puma", "M")).toBe("Puma not found in the data");
      expect(mapSizeToUS("men", "Nike")).toBe("No size provided");
      expect(mapSizeToUS("men", "Nike", "M", "chest")).toBe("chest not found in Nike, M data");
    });
  });
});
