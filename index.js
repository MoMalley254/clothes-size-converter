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
const trousers = require("./src/converters/trousers/convertTrouser");
const shoes = require("./src/converters/shoes/convertShoe");
const dresses = require("./src/converters/dresses/convertDress");

const converters = {
  shirts,
  trousers,
  shoes,
  dresses,
};

module.exports = converters;
