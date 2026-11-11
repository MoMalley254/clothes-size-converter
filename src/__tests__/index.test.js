const converters = require("../../index");

const COMMON_API = [
  "listAllData",
  "listGenderData",
  "listBrands",
  "listSizesForBrand",
  "listDimensionsForSize",
  "listDimensionsForSizeType",
  "listSizesFromDimensions",
  "mapSizeToUS",
];

describe("index", () => {
  test("exports every garment converter", () => {
    expect(Object.keys(converters).sort()).toEqual(["dresses", "shirts", "shoes", "trousers"]);
  });

  describe.each(Object.keys(converters))("%s", (name) => {
    test.each(COMMON_API)("exposes %s()", (fn) => {
      expect(typeof converters[name][fn]).toBe("function");
    });
  });

  test("shoes also expose the size-system helpers", () => {
    expect(typeof converters.shoes.convertShoeSize).toBe("function");
    expect(typeof converters.shoes.listSizeChart).toBe("function");
  });
});
