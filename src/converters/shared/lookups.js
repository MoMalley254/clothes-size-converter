"use strict";

/**
 * Generic lookup helpers shared by every garment converter.
 *
 * Each function takes the full data object (e.g. { men, women }) as the
 * first argument so the same logic works for shirts, trousers, dresses, etc.
 * Error messages are intentionally identical to the old convertShirt.js
 * implementations so existing callers keep working.
 */

function listAllData(data) {
  return data;
}

function listGenderData(data, gender) {
  return data[gender] || null;
}

function listBrands(data, gender) {
  const genderData = listGenderData(data, gender);
  if (!genderData) return `${gender} not found`;
  return Object.keys(genderData);
}

function listSizesForBrand(data, gender, brand) {
  const genderData = listGenderData(data, gender);
  if (!genderData) return `${gender} not found`;
  if (!genderData[brand]) return `${brand} not found in the data`;
  return genderData[brand];
}

function listDimensionsForSize(data, gender, brand, size) {
  const brandData = listSizesForBrand(data, gender, brand);
  if (typeof brandData !== "object") return brandData;
  if (!brandData[size]) return `${size} not found in the ${brand} data`;
  return brandData[size];
}

function listDimensionsForSizeType(data, gender, brand, size, sizeType) {
  const sizeData = listDimensionsForSize(data, gender, brand, size);
  if (typeof sizeData !== "object") return sizeData;
  if (!sizeType) return sizeData;
  if (!sizeData[sizeType]) {
    return `${sizeType} not found in ${brand}, ${size} data`;
  }
  return sizeData[sizeType];
}

function listSizesFromDimensions(data, gender, brand, dimensionsList) {
  const brandData = listSizesForBrand(data, gender, brand);
  if (typeof brandData !== "object") return brandData;

  const possibleSizes = [];

  Object.entries(brandData).forEach(([sizeLabel, measurements]) => {
    let match = true;

    dimensionsList.forEach((typeObj) => {
      const [key, value] = Object.entries(typeObj)[0];

      if (!measurements[key]) {
        match = false;
        return;
      }

      const [min, max] = measurements[key];
      if (value < min || value > max) {
        match = false;
      }
    });

    if (match) possibleSizes.push({ [sizeLabel]: measurements });
  });

  return possibleSizes;
}

function rangeOverlap([aMin, aMax], [bMin, bMax]) {
  return Math.min(aMax, bMax) - Math.max(aMin, bMin);
}

/**
 * Generic mapSizeToUS.
 *
 * @param {Object} usSizeLookUp  { men: {...}, women: {...} } for this garment
 * @param {Object} data          { men, women } brand data
 * @param {"men"|"women"} gender
 * @param {string} brand
 * @param {string} size
 * @param {string} [sizeType]
 */
function mapSizeToUS(usSizeLookUp, data, gender, brand, size, sizeType) {
  if (!size) return "No size provided";

  const dimensions = listDimensionsForSizeType(
    data,
    gender,
    brand,
    size,
    sizeType,
  );
  if (typeof dimensions === "string") return dimensions;

  const usSizes = usSizeLookUp[gender];
  if (!usSizes) return `${gender} not available in US lookup`;

  const brandDimensions = sizeType ? { [sizeType]: dimensions } : dimensions;

  const matches = [];
  Object.entries(usSizes).forEach(([usLabel, usDimensions]) => {
    let matchesAll = true,
      coverage = 0,
      compared = 0;
    for (const [key, brandRange] of Object.entries(brandDimensions)) {
      const usRange = usDimensions[key];
      if (!usRange) continue;
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
