"use strict";

/**
 * clothes-size-converter — public API
 *
 * Each garment type is exposed as a namespace, so every garment shares the
 * same shape and new ones can be added without name clashes:
 *
 *   const { shirts } = require("clothes-size-converter");
 *   shirts.listBrands("men");
 *
 */
const shirts = require("./src/converters/shirts/convertShirt");

const converters = {
  shirts,
  // trousers: require("./src/converters/trousers/convertTrouser"), // issue #4
  // shoes:    require("./src/converters/shoes/convertShoe"),       // issue #6
  // dresses:  require("./src/converters/dresses/convertDress"),    // issue #6
};

module.exports = converters;
