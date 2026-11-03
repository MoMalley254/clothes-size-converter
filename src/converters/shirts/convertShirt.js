const menShirtData = require("../../data/men/shirts.json");
const womenShirtData = require("../../data/women/shirts.json");
const lookups = require("../shared/lookups");

// US reference sizes, all values in cm as [min, max].
//
// Each size appears once under its canonical label. The old table also held
// alias keys with identical data (2XS = XXS, 1XS = XS, 1XL = XL, 2XL = XXL,
// XXXL = 3XL, XXXXL = 4XL, XXXXXL = 5XL, XXXXXXL = 6XL); those were collapsed.
//
// NOTE: the men's chart is carried over unchanged. It has a gap between XS and
// S (e.g. chest 86-91) that should be checked against the source chart. The
// women's chart is a first pass based on a generic US alpha size chart and
// should be verified before relying on it.
const usSizeLookUp = {
  men: {
    XXS: { chest: [76, 81], waist: [61, 66], hip: [76, 81] },
    XS: { chest: [81, 86], waist: [66, 71], hip: [81, 86] },
    S: { chest: [91, 96], waist: [76, 81], hip: [91, 96] },
    M: { chest: [96, 102], waist: [81, 86], hip: [96, 101] },
    L: { chest: [102, 107], waist: [86, 91], hip: [101, 106] },
    XL: { chest: [107, 112], waist: [91, 97], hip: [106, 111] },
    XXL: { chest: [112, 117], waist: [97, 102], hip: [111, 116] },
    "3XL": { chest: [117, 122], waist: [102, 107], hip: [116, 121] },
    "4XL": { chest: [122, 127], waist: [107, 112], hip: [121, 126] },
    "5XL": { chest: [127, 132], waist: [112, 117], hip: [126, 131] },
    "6XL": { chest: [132, 137], waist: [117, 122], hip: [131, 136] },
  },
  women: {
    XXS: { bust: [76, 81], waist: [58, 63], hip: [81, 86] },
    XS: { bust: [81, 86], waist: [63, 68], hip: [86, 91] },
    S: { bust: [86, 91], waist: [68, 73], hip: [91, 96] },
    M: { bust: [91, 97], waist: [73, 79], hip: [96, 102] },
    L: { bust: [97, 104], waist: [79, 86], hip: [102, 109] },
    XL: { bust: [104, 112], waist: [86, 94], hip: [109, 117] },
    XXL: { bust: [112, 120], waist: [94, 102], hip: [117, 125] },
    "3XL": { bust: [120, 128], waist: [102, 110], hip: [125, 133] },
  },
};

const shirtData = {
  men: menShirtData,
  women: womenShirtData,
};

const listAllData = () => lookups.listAllData(shirtData);
const listGenderData = (g) => lookups.listGenderData(shirtData, g);
const listBrands = (g) => lookups.listBrands(shirtData, g);
const listSizesForBrand = (g, b) => lookups.listSizesForBrand(shirtData, g, b);
const listDimensionsForSize = (g, b, s) =>
  lookups.listDimensionsForSize(shirtData, g, b, s);
const listDimensionsForSizeType = (g, b, s, st) =>
  lookups.listDimensionsForSizeType(shirtData, g, b, s, st);
const listSizesFromDimensions = (g, b, d) =>
  lookups.listSizesFromDimensions(shirtData, g, b, d);
const mapSizeToUS = (g, b, s, st) =>
  lookups.mapSizeToUS(usSizeLookUp, shirtData, g, b, s, st);

module.exports = {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions,
  mapSizeToUS,
};
