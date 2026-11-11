const shoes = require("../converters/shoes/convertShoe");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);
const SYSTEMS = ["EU", "UK", "US", "Asia"];

describe("shoes", () => {
  describe("brand charts", () => {
    test("listAllData / listGenderData / listBrands", () => {
      expect(shoes.listAllData().men.Nike).toBeDefined();
      expect(shoes.listAllData().women.Nike).toBeDefined();
      expect(shoes.listGenderData("men")).toBe(shoes.listAllData().men);
      expect(shoes.listGenderData("kids")).toBeNull();
      expect(shoes.listBrands("men")).toEqual(["Nike"]);
      expect(shoes.listBrands("kids")).toBe("kids not found");
    });

    test("are keyed by EU size and hold foot_length in cm", () => {
      expect(shoes.listDimensionsForSize("men", "Nike", "42")).toEqual({
        foot_length: [26.25, 26.75],
      });
      expect(shoes.listDimensionsForSizeType("women", "Nike", "38", "foot_length")).toEqual([
        23.75, 24.25,
      ]);
      expect(typeof shoes.listSizesForBrand("men", "Nike")).toBe("object");
    });

    test("lookup errors are error strings", () => {
      expect(shoes.listSizesForBrand("men", "Puma")).toBe("Puma not found in the data");
      expect(shoes.listDimensionsForSize("men", "Nike", "99")).toBe("99 not found in the Nike data");
      expect(shoes.listDimensionsForSizeType("men", "Nike", "42", "chest")).toBe(
        "chest not found in Nike, 42 data"
      );
    });

    test("listSizesFromDimensions finds sizes by foot length", () => {
      expect(
        labels(shoes.listSizesFromDimensions("men", "Nike", [{ foot_length: 26.5 }]))
      ).toEqual(["42"]);
      expect(shoes.listSizesFromDimensions("men", "Nike", [{ foot_length: 50 }])).toEqual([]);
    });
  });

  describe("mapSizeToUS", () => {
    test("maps a brand size to US sizes, best first", () => {
      const result = shoes.mapSizeToUS("men", "Nike", "42");
      expect(labels(result)[0]).toBe("9");
      expect(result[0]["9"].foot_length).toBeDefined();
      expect(shoes.mapSizeToUS("women", "Nike", "38").length).toBeGreaterThan(0);
    });

    test("returns error strings for bad input", () => {
      expect(shoes.mapSizeToUS("men", "Nike")).toBe("No size provided");
      expect(shoes.mapSizeToUS("kids", "Nike", "42")).toBe("kids not found");
      expect(shoes.mapSizeToUS("men", "Nike", "99")).toBe("99 not found in the Nike data");
    });
  });

  describe("convertShoeSize", () => {
    test("converts between every system", () => {
      expect(shoes.convertShoeSize("men", "US", 9, "EU")).toBe(42.5);
      expect(shoes.convertShoeSize("men", "US", 9, "UK")).toBe(8);
      expect(shoes.convertShoeSize("men", "US", 9, "Asia")).toBe(27);
      expect(shoes.convertShoeSize("men", "EU", 42.5, "US")).toBe(9);
      expect(shoes.convertShoeSize("women", "UK", 4.5, "US")).toBe(7);
      expect(shoes.convertShoeSize("women", "Asia", 25, "EU")).toBe(39);
    });

    test("accepts strings and any letter case", () => {
      expect(shoes.convertShoeSize("men", "us", "9", "eu")).toBe(42.5);
      expect(shoes.convertShoeSize("men", "EU", "42.5", "UK")).toBe(8);
    });

    describe.each(["men", "women"])("%s: every size round-trips through every system", (gender) => {
      test.each(shoes.listSizeChart(gender).map((row) => [row.US, row]))(
        "US %s",
        (_us, row) => {
          for (const from of SYSTEMS) {
            for (const to of SYSTEMS) {
              const converted = shoes.convertShoeSize(gender, from, row[from], to);
              expect(converted).toBe(row[to]);
              expect(shoes.convertShoeSize(gender, to, converted, from)).toBe(row[from]);
            }
          }
        }
      );
    });

    test("returns error strings for bad input", () => {
      const unsupported = "is not a supported size system (EU, UK, US, Asia)";
      expect(shoes.convertShoeSize("kids", "US", 9, "EU")).toBe("kids not found");
      expect(shoes.convertShoeSize("men", "US", undefined, "EU")).toBe("No size provided");
      expect(shoes.convertShoeSize("men", "FR", 9, "EU")).toBe(`FR ${unsupported}`);
      expect(shoes.convertShoeSize("men", "US", 9, "FR")).toBe(`FR ${unsupported}`);
      expect(shoes.convertShoeSize("men", "US", 20, "EU")).toBe("20 not found in US sizes for men");
    });
  });

  describe("listSizeChart", () => {
    test("returns one row per size, or an error string", () => {
      expect(shoes.listSizeChart("men")[0]).toEqual({ EU: 38.5, UK: 5, US: 6, Asia: 24 });
      expect(shoes.listSizeChart("kids")).toBe("kids not found");
    });

    test("the Asia size is the midpoint of the Nike foot length range", () => {
      for (const gender of ["men", "women"]) {
        for (const row of shoes.listSizeChart(gender)) {
          const [min, max] = shoes.listDimensionsForSizeType(
            gender,
            "Nike",
            String(row.EU),
            "foot_length"
          );
          expect((min + max) / 2).toBe(row.Asia);
        }
      }
    });

    test("every EU size in the chart has a Nike brand entry", () => {
      for (const gender of ["men", "women"]) {
        for (const row of shoes.listSizeChart(gender)) {
          expect(typeof shoes.listDimensionsForSize(gender, "Nike", String(row.EU))).toBe("object");
        }
      }
    });
  });
});
