"use strict";

const menShoeData = require("../../data/men/shoes.json");
const womenShoeData = require("../../data/women/shoes.json");
const lookups = require("../shared/lookups");

// Brand charts are keyed by EU size and hold one measurement: foot_length, in
// cm as [min, max]. That lets the shared lookups (listSizesFromDimensions,
// mapSizeToUS, ...) work for shoes exactly as they do for shirts.
const shoeData = { men: menShoeData, women: womenShoeData };

// ---------------------------------------------------------------------------
// Size systems (EU / UK / US / Asia)
// ---------------------------------------------------------------------------
// Each row is [US, EU, Asia]. Asia is the Japanese/CM size, which is the foot
// length in cm. UK is derived from US (men: US - 1, women: US - 2.5).
// Based on Nike's published size charts; verify before relying on it.
const SYSTEMS = ["EU", "UK", "US", "Asia"];
const UK_OFFSET = { men: 1, women: 2.5 };

const SIZE_ROWS = {
  men: [
    [6, 38.5, 24], [6.5, 39, 24.5], [7, 40, 25], [7.5, 40.5, 25.5],
    [8, 41, 26], [8.5, 42, 26.5], [9, 42.5, 27], [9.5, 43, 27.5],
    [10, 44, 28], [10.5, 44.5, 28.5], [11, 45, 29], [11.5, 45.5, 29.5],
    [12, 46, 30], [12.5, 47, 30.5], [13, 47.5, 31],
  ],
  women: [
    [5, 35.5, 22], [5.5, 36, 22.5], [6, 36.5, 23], [6.5, 37.5, 23.5],
    [7, 38, 24], [7.5, 38.5, 24.5], [8, 39, 25], [8.5, 40, 25.5],
    [9, 40.5, 26], [9.5, 41, 26.5], [10, 42, 27], [10.5, 42.5, 27.5],
    [11, 43, 28],
  ],
};

const sizeChart = (gender) =>
  SIZE_ROWS[gender].map(([us, eu, asia]) => ({
    EU: eu,
    UK: us - UK_OFFSET[gender],
    US: us,
    Asia: asia,
  }));

// US reference chart: foot_length [min, max] (cm) per US size, built from the
// usual rule of thumb that one US size is 1/3 inch (0.847 cm). Men's US 7 is
// anchored at 24.8 cm; women's sizes run 1.5 sizes up from men's.
const US_CM_PER_SIZE = 0.847;
const US_MEN_7_CM = 24.8;
const round2 = (n) => Math.round(n * 100) / 100;

function buildUsFootChart(gender) {
  const half = US_CM_PER_SIZE / 4; // half a size either side of the centre
  const shift = gender === "women" ? 1.5 : 0;
  const chart = {};
  for (const [us] of SIZE_ROWS[gender]) {
    const centre = US_MEN_7_CM + (us + shift - 7) * US_CM_PER_SIZE;
    chart[String(us)] = {
      foot_length: [round2(centre - half), round2(centre + half)],
    };
  }
  return chart;
}

const usSizeLookUp = {
  men: buildUsFootChart("men"),
  women: buildUsFootChart("women"),
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const listAllData = () => lookups.listAllData(shoeData);
const listGenderData = (g) => lookups.listGenderData(shoeData, g);
const listBrands = (g) => lookups.listBrands(shoeData, g);
const listSizesForBrand = (g, b) => lookups.listSizesForBrand(shoeData, g, b);
const listDimensionsForSize = (g, b, s) =>
  lookups.listDimensionsForSize(shoeData, g, b, s);
const listDimensionsForSizeType = (g, b, s, st) =>
  lookups.listDimensionsForSizeType(shoeData, g, b, s, st);
const listSizesFromDimensions = (g, b, d) =>
  lookups.listSizesFromDimensions(shoeData, g, b, d);
const mapSizeToUS = (g, b, s, st) =>
  lookups.mapSizeToUS(usSizeLookUp, shoeData, g, b, s, st);

/** Every size in the EU / UK / US / Asia systems for a gender. */
function listSizeChart(gender) {
  if (!SIZE_ROWS[gender]) return `${gender} not found`;
  return sizeChart(gender);
}

/**
 * Convert a shoe size between systems.
 *
 * @param {"men"|"women"} gender
 * @param {string} from  "EU" | "UK" | "US" | "Asia" (case-insensitive)
 * @param {number|string} size
 * @param {string} to
 * @returns {number|string} the converted size, or an error string
 */
function convertShoeSize(gender, from, size, to) {
  if (!SIZE_ROWS[gender]) return `${gender} not found`;
  if (size === undefined || size === null || size === "") {
    return "No size provided";
  }

  const resolve = (name) =>
    SYSTEMS.find((s) => s.toLowerCase() === String(name).toLowerCase());
  const fromSystem = resolve(from);
  const toSystem = resolve(to);
  const supported = `(${SYSTEMS.join(", ")})`;
  if (!fromSystem) return `${from} is not a supported size system ${supported}`;
  if (!toSystem) return `${to} is not a supported size system ${supported}`;

  const row = sizeChart(gender).find((r) => r[fromSystem] === Number(size));
  if (!row) return `${size} not found in ${fromSystem} sizes for ${gender}`;
  return row[toSystem];
}

module.exports = {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions,
  mapSizeToUS,
  listSizeChart,
  convertShoeSize,
};
