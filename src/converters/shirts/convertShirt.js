const menShirtData = require("../../data/men/shirts.json");
const womenShirtData = require("../../data/women/shirts.json");

const usSizeLookUp = {
  men: {
    XXS: [{ chest: [76, 81] }, { waist: [61, 66] }, { hip: [76, 81] }],
    "2XS": [{ chest: [76, 81] }, { waist: [61, 66] }, { hip: [76, 81] }],
    XS: [{ chest: [81, 86] }, { waist: [66, 71] }, { hip: [81, 86] }],
    "1XS": [{ chest: [81, 86] }, { waist: [66, 71] }, { hip: [81, 86] }],
    S: [{ chest: [91, 96] }, { waist: [76, 81] }, { hip: [91, 96] }],
    M: [{ chest: [96, 102] }, { waist: [81, 86] }, { hip: [96, 101] }],
    L: [{ chest: [102, 107] }, { waist: [86, 91] }, { hip: [101, 106] }],
    XL: [{ chest: [107, 112] }, { waist: [91, 97] }, { hip: [106, 111] }],
    "1XL": [{ chest: [107, 112] }, { waist: [91, 97] }, { hip: [106, 111] }],
    XXL: [{ chest: [112, 117] }, { waist: [97, 102] }, { hip: [111, 116] }],
    "2XL": [{ chest: [112, 117] }, { waist: [97, 102] }, { hip: [111, 116] }],
    XXXL: [{ chest: [117, 122] }, { waist: [102, 107] }, { hip: [116, 121] }],
    "3XL": [{ chest: [117, 122] }, { waist: [102, 107] }, { hip: [116, 121] }],
    XXXXL: [{ chest: [122, 127] }, { waist: [107, 112] }, { hip: [121, 126] }],
    "4XL": [{ chest: [122, 127] }, { waist: [107, 112] }, { hip: [121, 126] }],
    XXXXXL: [{ chest: [127, 132] }, { waist: [112, 117] }, { hip: [126, 131] }],
    "5XL": [{ chest: [127, 132] }, { waist: [112, 117] }, { hip: [126, 131] }],
    XXXXXXL: [
      { chest: [132, 137] },
      { waist: [117, 122] },
      { hip: [131, 136] },
    ],
    "6XL": [{ chest: [132, 137] }, { waist: [117, 122] }, { hip: [131, 136] }],
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

// function mapSizeToUS(gender, brand, size, sizesType) {
//   let sizeDataToUse;
//   let possibleSize = [];
//   if (size && !sizesType) {
//     sizeDataToUse = listDimensionsForSize(gender, brand, size);
//     if (!Object.keys(usSizeLookUp).includes(gender)) {
//       return `${gender} not available in US lookup`;
//     }

//     if (!Object.keys(usSizeLookUp[gender]).includes(size)) {
//       return `${size} not found in US lookup`;
//     }

//     const dimensionToLookup = usSizeLookUp[gender];

//     // console.dir(`Dimensions to lookup ${JSON.stringify(dimensionToLookup)}`, {
//     //   depth: null,
//     //   color: true,
//     // });
//     console.log(`Dimensions to use ${JSON.stringify(sizeDataToUse)}`);

//     Object.entries(dimensionToLookup).forEach(([sizeLabel, measurements]) => {
//       let matchesAll = [];
//       measurements.forEach((dimensions) => {
//         Object.entries(dimensions).forEach(([sizeType, actualDimensions]) => {
//           let dimensionMatches = false;
//           const inputDimensions = sizeDataToUse[sizeType];

//           if (!inputDimensions) return;

//           const [lookupMin, lookupMax] = actualDimensions;
//           const [inputMin, inputMax] = inputDimensions;

//           if (inputMin <= lookupMin && lookupMax <= inputMax) {
//             matchesAll.push(true);
//           } else {
//             matchesAll.push(false);
//           }
//         });
//       });
//       if (
//         matchesAll.every((entry) => {
//           // return true/false based on some condition
//           return entry.isValid;
//         })
//       ) {
//         console.log(`Found match ${sizeLabel}`);
//         possibleSize.push({ [sizeLabel]: measurements });
//       }
//     });
//     // } else if (size && sizesType) {
//     //     sizeDataToUse = listDimensionsForSize(gender, brand, size, sizesType);
//   } else if (sizesType) {
//     sizeDataToUse = listSizesFromDimensions(gender, brand, sizesType);
//   } else {
//     return `No sizes provided`;
//   }

//   return possibleSize;
// }

module.exports = {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions,
  // mapSizeToUS,
};
