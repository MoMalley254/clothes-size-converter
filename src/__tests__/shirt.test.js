const shirts = require("../converters/shirts/convertShirt");

describe("shirts", () => {
  test("listAllData returns men and women", () => {
    const data = shirts.listAllData();
    expect(data.men.Nike).toBeDefined();
    expect(data.women.Adidas).toBeDefined();
  });

  test("listGenderData returns data for a known gender and null otherwise", () => {
    expect(shirts.listGenderData("men")).toBe(shirts.listAllData().men);
    expect(shirts.listGenderData("women")).toBe(shirts.listAllData().women);
    expect(shirts.listGenderData("kids")).toBeNull();
  });

  test("listBrands returns brand names, or an error string for an unknown gender", () => {
    expect([...shirts.listBrands("men")].sort()).toEqual([
      "Adidas",
      "H&M",
      "Levi's",
      "Nike",
      "Zara",
    ]);
    expect([...shirts.listBrands("women")].sort()).toEqual([
      "Adidas",
      "H&M",
      "Levi's",
      "Nike",
      "Zara",
    ]);
    expect(shirts.listBrands("kids")).toBe("kids not found");
  });

  test("listSizesForBrand returns the brand chart or an error string", () => {
    const nike = shirts.listSizesForBrand("men", "Nike");
    expect(nike.M).toBeDefined();
    expect(shirts.listSizesForBrand("kids", "Nike")).toBe("kids not found");
    expect(shirts.listSizesForBrand("men", "Puma")).toBe("Puma not found in the data");
  });

  test("listDimensionsForSize returns a size's measurements", () => {
    expect(shirts.listDimensionsForSize("women", "Adidas", "M")).toEqual({
      bust: [89, 94],
      waist: [73, 78],
      hip: [98, 103],
    });
    expect(shirts.listDimensionsForSize("men", "Nike", "ZZ")).toBe(
      "ZZ not found in the Nike data"
    );
  });

  test("listDimensionsForSizeType returns one measurement or all", () => {
    expect(shirts.listDimensionsForSizeType("men", "Nike", "L", "chest")).toEqual([
      104, 112,
    ]);
    expect(shirts.listDimensionsForSizeType("men", "Nike", "L")).toEqual({
      chest: [104, 112],
      waist: [89, 97],
      hip: [104, 112],
    });
    expect(shirts.listDimensionsForSizeType("men", "Nike", "L", "bust")).toBe(
      "bust not found in Nike, L data"
    );
  });

  describe("H&M men's chart (official size guide)", () => {
    test("each letter size spans two numbered sizes, in cm", () => {
      expect(shirts.listDimensionsForSize("men", "H&M", "M")).toEqual({
        chest: [94, 102],
        waist: [82, 90],
      });
      // XXS is a single numbered size (EUR 38)
      expect(shirts.listDimensionsForSize("men", "H&M", "XXS")).toEqual({
        chest: [74, 78],
        waist: [62, 66],
      });
    });

    test("has chest and waist only, from XXS to XXL", () => {
      const chart = shirts.listSizesForBrand("men", "H&M");
      expect(Object.keys(chart)).toEqual(["XXS", "XS", "S", "M", "L", "XL", "XXL"]);
      for (const dimensions of Object.values(chart)) {
        expect(Object.keys(dimensions)).toEqual(["chest", "waist"]);
      }
    });

    test("neighbouring sizes meet edge to edge, with no gaps", () => {
      const sizes = Object.values(shirts.listSizesForBrand("men", "H&M"));
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i].chest[0]).toBe(sizes[i - 1].chest[1]);
        expect(sizes[i].waist[0]).toBe(sizes[i - 1].waist[1]);
      }
    });

    test("finds a size from body measurements and maps it to US", () => {
      const found = shirts.listSizesFromDimensions("men", "H&M", [{ chest: 100 }, { waist: 85 }]);
      expect(found.map((e) => Object.keys(e)[0])).toEqual(["M"]);
      expect(shirts.mapSizeToUS("men", "H&M", "M").map((e) => Object.keys(e)[0])).toEqual(["M"]);
    });
  });

  describe("listSizesFromDimensions", () => {
    test("combines several measurements", () => {
      expect(
        shirts.listSizesFromDimensions("men", "Nike", [{ chest: 100 }, { waist: 84 }])
      ).toEqual([
        { M: { chest: [96, 104], waist: [81, 89], hip: [96, 104] } },
        { "M-Tall": { chest: [96, 104], waist: [81, 89], hip: [96, 104] } },
      ]);
    });

    test("includes both ends of a range", () => {
      const low = shirts.listSizesFromDimensions("men", "Nike", [{ chest: 96 }]);
      const high = shirts.listSizesFromDimensions("men", "Nike", [{ chest: 104 }]);
      expect(low.some((entry) => entry.M)).toBe(true);
      expect(high.some((entry) => entry.M)).toBe(true);
    });

    test("returns [] when nothing matches", () => {
      expect(shirts.listSizesFromDimensions("men", "Nike", [{ chest: 999 }])).toEqual([]);
    });

    test("men's shirts have no bust measurement", () => {
      expect(shirts.listSizesFromDimensions("men", "Nike", [{ bust: 90 }])).toEqual([]);
    });

    test("returns an error string for an unknown brand", () => {
      expect(shirts.listSizesFromDimensions("men", "Puma", [{ chest: 100 }])).toBe(
        "Puma not found in the data"
      );
    });
  });
});
