"use strict";

const menTrouserData = require("../../data/men/trousers.json");
const womenTrouserData = require("../../data/women/trousers.json");
const lookups = require("../shared/lookups");

const trouserData = { men: menTrouserData, women: womenTrouserData };

// US reference trouser sizes, cm [min, max]. Only waist / hip / inseam.
const usSizeLookUp = {
  men: {
    XS: { waist: [71, 76], hip: [86, 91], inseam: [79, 81] },
    S: { waist: [76, 81], hip: [91, 96], inseam: [79, 81] },
    M: { waist: [81, 86], hip: [96, 101], inseam: [80, 82] },
    L: { waist: [86, 91], hip: [101, 106], inseam: [80, 82] },
    XL: { waist: [91, 97], hip: [106, 111], inseam: [81, 83] },
    XXL: { waist: [97, 102], hip: [111, 116], inseam: [81, 83] },
  },
  women: {
    XS: { waist: [58, 63], hip: [81, 86], inseam: [77, 79] },
    S: { waist: [63, 68], hip: [86, 91], inseam: [77, 79] },
    M: { waist: [68, 73], hip: [91, 96], inseam: [78, 80] },
    L: { waist: [73, 79], hip: [96, 102], inseam: [78, 80] },
    XL: { waist: [79, 86], hip: [102, 109], inseam: [79, 81] },
    XXL: { waist: [86, 94], hip: [109, 117], inseam: [79, 81] },
  },
};

const listAllData = () => lookups.listAllData(trouserData);
const listGenderData = (g) => lookups.listGenderData(trouserData, g);
const listBrands = (g) => lookups.listBrands(trouserData, g);
const listSizesForBrand = (g, b) =>
  lookups.listSizesForBrand(trouserData, g, b);
const listDimensionsForSize = (g, b, s) =>
  lookups.listDimensionsForSize(trouserData, g, b, s);
const listDimensionsForSizeType = (g, b, s, st) =>
  lookups.listDimensionsForSizeType(trouserData, g, b, s, st);
const listSizesFromDimensions = (g, b, d) =>
  lookups.listSizesFromDimensions(trouserData, g, b, d);
const mapSizeToUS = (g, b, s, st) =>
  lookups.mapSizeToUS(usSizeLookUp, trouserData, g, b, s, st);

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
