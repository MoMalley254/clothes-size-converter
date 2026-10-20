const menShirtData = require("../../data/men/shirts.json");
const womenShirtData = require("../../data/women/shirts.json");

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

function listAllData() {
  return {
    men: menShirtData,
    women: womenShirtData,
  };
}

function listGenderData(gender) {
  if (gender === "men") return menShirtData;
  if (gender === "women") return womenShirtData;
  return null;
}

function listBrands(gender) {
  const data = listGenderData(gender);
  if (!data) return `${gender} not found`;

  return Object.keys(data);
}

function listSizesForBrand(gender, brand) {
  const data = listGenderData(gender);
  if (!data) return `${gender} not found`;

  if (!data[brand]) {
    return `${brand} not found in the data`;
  }

  return data[brand];
}

function listDimensionsForSize(gender, brand, size) {
  const brandData = listSizesForBrand(gender, brand);

  if (typeof brandData !== "object") return brandData;

  if (!brandData[size]) {
    return `${size} not found in the ${brand} data`;
  }

  return brandData[size];
}

function listDimensionsForSizeType(gender, brand, size, sizeType) {
  const sizeData = listDimensionsForSize(gender, brand, size);

  if (typeof sizeData !== "object") return sizeData;

  //If no sizeType provided return entire dimensions
  if (!sizeType) return sizeData;

  if (!sizeData[sizeType]) {
    return `${sizeType} not found in ${brand}, ${size} data`;
  }

  return sizeData[sizeType];
}

function listSizesFromDimensions(gender, brand, sizesType) {
  const brandData = listSizesForBrand(gender, brand);
  if (typeof brandData !== "object") return brandData;

  const possibleSizes = [];

  // Iterate over each size in the brand
  Object.entries(brandData).forEach(([sizeLabel, measurements]) => {
    let match = true;

    sizesType.forEach((typeObj) => {
      const [key, value] = Object.entries(typeObj)[0]; // e.g., ["bust", 90]

      if (!measurements[key]) {
        match = false; // key does not exist
        return;
      }

      const [min, max] = measurements[key];
      if (value < min || value > max) {
        match = false; // value not in range
      }
    });

    if (match) possibleSizes.push({ [sizeLabel]: measurements });
  });

  return possibleSizes;
}

// Length of the overlap between two [min, max] ranges (<= 0 means no overlap)
function rangeOverlap([aMin, aMax], [bMin, bMax]) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin);
}

/**
 * Map a brand's size to the matching US size(s).
 *
 * A US size matches when, for every measurement the two charts share, the
 * brand's range and the US range overlap by more than a single point
 * (ranges that merely touch at an edge do not match). Matches are ordered
 * best first, by how much of the brand's range the US range covers.
 *
 * @param {"men"|"women"} gender
 * @param {string} brand        e.g. "Nike"
 * @param {string} size         the brand's size label, e.g. "M" or "L-Tall"
 * @param {string} [sizeType]   optional: only compare this measurement,
 *                              e.g. "chest"
 * @returns {Array<Object>|string} e.g. [{ M: { chest: [96, 102], ... } }],
 *   an empty array if no US size matches, or an error string if the input
 *   is not found (same convention as the other list* functions).
 */
function mapSizeToUS(gender, brand, size, sizeType) {
  if (!size) return "No size provided";

  const dimensions = listDimensionsForSizeType(gender, brand, size, sizeType);
  if (typeof dimensions === "string") return dimensions;

  const usSizes = usSizeLookUp[gender];
  if (!usSizes) return `${gender} not available in US lookup`;

  // With a sizeType, `dimensions` is a single [min, max] range
  const brandDimensions = sizeType ? { [sizeType]: dimensions } : dimensions;

  const matches = [];

  Object.entries(usSizes).forEach(([usLabel, usDimensions]) => {
    let matchesAll = true;
    let coverage = 0;
    let compared = 0;

    for (const [key, brandRange] of Object.entries(brandDimensions)) {
      const usRange = usDimensions[key];
      if (!usRange) continue; // measurement not in the US chart

      const overlap = rangeOverlap(brandRange, usRange);
      if (overlap <= 0) {
        matchesAll = false;
        break;
      }

      coverage += overlap / (brandRange[1] - brandRange[0] || 1);
      compared++;
    }

    if (matchesAll && compared > 0) {
      matches.push({ usLabel, usDimensions, score: coverage / compared });
    }
  });

  // Array.prototype.sort is stable, so ties keep the US chart order
  matches.sort((a, b) => b.score - a.score);

  return matches.map(({ usLabel, usDimensions }) => ({
    [usLabel]: usDimensions,
  }));
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
};
