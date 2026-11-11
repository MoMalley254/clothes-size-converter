const { mapSizeToUS } = require("../converters/shirts/convertShirt");

const labels = (result) => result.map((entry) => Object.keys(entry)[0]);

describe("shirts.mapSizeToUS", () => {
  test("maps a brand size to US sizes, best match first", () => {
    // Nike men L: chest 104-112 is mostly inside US XL (107-112)
    expect(labels(mapSizeToUS("men", "Nike", "L"))).toEqual(["XL", "L"]);
  });

  test("returns the US dimensions alongside each label", () => {
    const [match] = mapSizeToUS("women", "Adidas", "M");
    expect(match).toEqual({
      M: { bust: [91, 97], waist: [73, 79], hip: [96, 102] },
    });
  });

  test("works for women", () => {
    expect(labels(mapSizeToUS("women", "Nike", "XXL"))).toEqual(["XXL", "3XL"]);
  });

  test("tall sizes map the same as their regular size", () => {
    expect(mapSizeToUS("men", "Nike", "S-Tall")).toEqual(
      mapSizeToUS("men", "Nike", "S")
    );
  });

  test("sizeType restricts the comparison to one measurement", () => {
    expect(labels(mapSizeToUS("men", "Nike", "M"))).toEqual(["M", "L"]);
    expect(labels(mapSizeToUS("men", "Nike", "M", "chest"))).toEqual(["M", "L"]);
    // Nike M waist 81-89 overlaps US M (81-86) and L (86-91)
    expect(labels(mapSizeToUS("men", "Nike", "M", "waist"))).toEqual(["M", "L"]);
  });

  test("ranges that only touch at an edge do not match", () => {
    // Nike men XL chest starts at 112, exactly where US XL chest (107-112) ends
    const result = labels(mapSizeToUS("men", "Nike", "XL"));
    expect(result).not.toContain("XL");
    expect(result).toContain("XXL");
  });

  test("returns an empty array when no US size matches", () => {
    // Nike men 4XL-Tall chest 143-154 is beyond the US chart (max 137)
    expect(mapSizeToUS("men", "Nike", "4XL-Tall")).toEqual([]);
  });

  test("returns error strings for bad input", () => {
    expect(mapSizeToUS("kids", "Nike", "M")).toBe("kids not found");
    expect(mapSizeToUS("men", "Puma", "M")).toBe("Puma not found in the data");
    expect(mapSizeToUS("men", "Nike", "ZZ")).toBe("ZZ not found in the Nike data");
    expect(mapSizeToUS("men", "Nike")).toBe("No size provided");
    expect(mapSizeToUS("men", "Nike", "M", "bust")).toBe(
      "bust not found in Nike, M data"
    );
  });

  test("does not write to the console", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    try {
      mapSizeToUS("men", "Nike", "M");
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
