"use strict";

const womenDressData = require("../../data/women/dresses.json");
const lookups = require("../shared/lookups");

// Dresses are women's only, so there is no `men` key: lookups for "men" return
// the usual "men not found" error string.
const dressData = { women: womenDressData };

// US reference dress sizes, cm [min, max]. This is the same generic US alpha
// chart used for women's shirts, so a dress M and a shirt M line up. Verify
// against a source chart before relying on it.
const usSizeLookUp = {
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

const listAllData = () => lookups.listAllData(dressData);
const listGenderData = (g) => lookups.listGenderData(dressData, g);
const listBrands = (g) => lookups.listBrands(dressData, g);
const listSizesForBrand = (g, b) => lookups.listSizesForBrand(dressData, g, b);
const listDimensionsForSize = (g, b, s) =>
  lookups.listDimensionsForSize(dressData, g, b, s);
const listDimensionsForSizeType = (g, b, s, st) =>
  lookups.listDimensionsForSizeType(dressData, g, b, s, st);
const listSizesFromDimensions = (g, b, d) =>
  lookups.listSizesFromDimensions(dressData, g, b, d);
const mapSizeToUS = (g, b, s, st) =>
  lookups.mapSizeToUS(usSizeLookUp, dressData, g, b, s, st);

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
