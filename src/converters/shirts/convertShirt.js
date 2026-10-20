const menShirtData = require("../../data/men/shirts.json");
const womenShirtData = require("../../data/women/shirts.json");

// US letter-size reference windows, in centimetres, normalised to the same
// shape as the brand data: { sizeLabel: { dimension: [min, max] } }.
// The ranges are approximate reference windows; a brand's own chart can be
// wider or offset from them. Men use chest measurements, women use bust.
// Aliases (e.g. "XXS" / "2XS") describe the same window and both are kept so
// either spelling can be matched.
const usSizeLookUp = {
  men: {
    XXS: { chest: [76, 81], waist: [61, 66], hip: [76, 81] },
    "2XS": { chest: [76, 81], waist: [61, 66], hip: [76, 81] },
    XS: { chest: [81, 86], waist: [66, 71], hip: [81, 86] },
    "1XS": { chest: [81, 86], waist: [66, 71], hip: [81, 86] },
    S: { chest: [91, 96], waist: [76, 81], hip: [91, 96] },
    M: { chest: [96, 102], waist: [81, 86], hip: [96, 101] },
    L: { chest: [102, 107], waist: [86, 91], hip: [101, 106] },
    XL: { chest: [107, 112], waist: [91, 97], hip: [106, 111] },
    "1XL": { chest: [107, 112], waist: [91, 97], hip: [106, 111] },
    XXL: { chest: [112, 117], waist: [97, 102], hip: [111, 116] },
    "2XL": { chest: [112, 117], waist: [97, 102], hip: [111, 116] },
    XXXL: { chest: [117, 122], waist: [102, 107], hip: [116, 121] },
    "3XL": { chest: [117, 122], waist: [102, 107], hip: [116, 121] },
    XXXXL: { chest: [122, 127], waist: [107, 112], hip: [121, 126] },
    "4XL": { chest: [122, 127], waist: [107, 112], hip: [121, 126] },
    XXXXXL: { chest: [127, 132], waist: [112, 117], hip: [126, 131] },
    "5XL": { chest: [127, 132], waist: [112, 117], hip: [126, 131] },
    XXXXXXL: { chest: [132, 137], waist: [117, 122], hip: [131, 136] },
    "6XL": { chest: [132, 137], waist: [117, 122], hip: [131, 136] },
  },
  women: {
    XXS: { bust: [72, 81], waist: [58, 63], hip: [82, 87] },
    "2XS": { bust: [72, 81], waist: [58, 63], hip: [82, 87] },
    XS: { bust: [81, 86], waist: [63, 68], hip: [86, 91] },
    S: { bust: [86, 94], waist: [68, 74], hip: [91, 99] },
    M: { bust: [94, 102], waist: [74, 80], hip: [99, 107] },
    L: { bust: [102, 109], waist: [80, 87], hip: [107, 115] },
    XL: { bust: [109, 117], waist: [87, 95], hip: [115, 123] },
    XXL: { bust: [117, 126], waist: [95, 104], hip: [123, 132] },
    "2XL": { bust: [117, 126], waist: [95, 104], hip: [123, 132] },
    XXXL: { bust: [126, 135], waist: [104, 113], hip: [132, 140] },
    "3XL": { bust: [126, 135], waist: [104, 113], hip: [132, 140] },
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

function mapSizeToUS(gender, brand, size) {
  // Matches a brand's size label to US letter size(s) by comparing the
  // brand's measurement window with the US reference windows above.
  //
  // For each US size, the overlap length is summed across every dimension the
  // two entries share, and the US size(s) with the largest total overlap are
  // returned. A brand chart that is wider than a US window therefore maps to
  // the US size its measurements sit in, rather than to every window it
  // touches; two US sizes can still tie when a brand window straddles them
  // evenly, and alias labels ("XL"/"1XL") always tie because they share one
  // window, so the result is a list.
  if (!size) return `No size provided`;

  const lookup = usSizeLookUp[gender];
  if (!lookup) return `${gender} not available in US lookup`;

  // Validate the size against the brand's own chart, not the US lookup:
  // labels like "S-Tall" or "2XS" exist per brand.
  const dimensions = listDimensionsForSize(gender, brand, size);
  if (typeof dimensions !== "object") return dimensions;

  const overlapLength = (a, b) => Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]));

  let best = 0;
  let matches = [];
  for (const [usLabel, usDimensions] of Object.entries(lookup)) {
    let total = 0;
    for (const key of Object.keys(usDimensions)) {
      if (dimensions[key] !== undefined) {
        total += overlapLength(dimensions[key], usDimensions[key]);
      }
    }
    if (total === 0) continue;
    if (total > best) {
      best = total;
      matches = [usLabel];
    } else if (total === best) {
      matches.push(usLabel);
    }
  }

  if (matches.length === 0) {
    return `${size} (${brand}, ${gender}) does not overlap any US size`;
  }
  return matches;
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
