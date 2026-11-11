const dresses = require("../converters/dresses/convertDress");
const shirts = require("../converters/shirts/convertShirt");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

describe("dresses", () => {
  test("are women's only", () => {
    expect(dresses.listGenderData("men")).toBeNull();
    expect(dresses.listBrands("men")).toBe("men not found");
    expect([...dresses.listBrands("women")].sort()).toEqual([
      "Adidas",
      "H&M",
      "Levi's",
      "Nike",
      "Zara",
    ]);
  });

  test("listAllData only holds women", () => {
    expect(Object.keys(dresses.listAllData())).toEqual(["women"]);
  });

  test("charts use bust, waist and hip, with no Tall variants", () => {
    const nike = dresses.listSizesForBrand("women", "Nike");
    expect(dresses.listDimensionsForSize("women", "Nike", "M")).toEqual(nike.M);
    expect(Object.keys(nike.M)).toEqual(["bust", "waist", "hip"]);
    for (const brand of dresses.listBrands("women")) {
      for (const size of Object.keys(dresses.listSizesForBrand("women", brand))) {
        expect(size.endsWith("-Tall")).toBe(false);
      }
    }
  });

  test("measurements match the women's shirt chart for the same size", () => {
    expect(dresses.listDimensionsForSize("women", "H&M", "M")).toEqual(
      shirts.listDimensionsForSize("women", "H&M", "M")
    );
  });

  test("listDimensionsForSizeType returns one range or all", () => {
    expect(dresses.listDimensionsForSizeType("women", "Adidas", "M", "bust")).toEqual([89, 94]);
    expect(dresses.listDimensionsForSizeType("women", "Adidas", "M")).toEqual({
      bust: [89, 94],
      waist: [73, 78],
      hip: [98, 103],
    });
  });

  test("listSizesFromDimensions finds dress sizes", () => {
    const result = dresses.listSizesFromDimensions("women", "Adidas", [
      { bust: 90 },
      { waist: 74 },
      { hip: 100 },
    ]);
    expect(labels(result)).toEqual(["M"]);
    expect(dresses.listSizesFromDimensions("women", "Adidas", [{ bust: 300 }])).toEqual([]);
  });

  test("mapSizeToUS maps a dress size to US sizes, like shirts", () => {
    expect(labels(dresses.mapSizeToUS("women", "Adidas", "M"))).toContain("M");
    expect(dresses.mapSizeToUS("women", "Adidas", "M")).toEqual(
      shirts.mapSizeToUS("women", "Adidas", "M")
    );
  });

  test("lookups return error strings for bad input", () => {
    expect(dresses.listSizesForBrand("women", "Puma")).toBe("Puma not found in the data");
    expect(dresses.mapSizeToUS("men", "Nike", "M")).toBe("men not found");
    expect(dresses.mapSizeToUS("women", "Nike")).toBe("No size provided");
    expect(dresses.listDimensionsForSize("women", "Nike", "ZZ")).toBe(
      "ZZ not found in the Nike data"
    );
  });
});
