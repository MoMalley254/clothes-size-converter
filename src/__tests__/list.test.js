const {
  listAllData,
  listGenderData,
  listBrands,
  listSizesForBrand,
  listDimensionsForSize,
  listDimensionsForSizeType,
  listSizesFromDimensions
} = require("../converters/shirts/convertShirt");

//List shirt data tests
// console.log('--- listAllData() ---');
// console.dir(listAllData(), { depth: null, color: true });

// console.log('--- listShirtData("men") ---');
// console.dir(listShirtData("men"), { depth: null, color: true });

// console.log('--- listBrands("women") ---');
// console.log(listBrands("women"));

// console.log('--- listSizesForBrand("men", "Nike") ---');
// console.log(listSizesForBrand("men", "Nike"));

// console.log('--- listDimensionsForSize("women", "Nike", "M") ---');
// console.log(listDimensionsForSize("women", "Nike", "M"));

console.log('--- listDimensionsForSizeType("women", "Nike", "M", "bust") ---');
console.log(listDimensionsForSizeType("women", "Nike", "M", "bust"));

// console.log('--- listSizesFromDimensions("women", "Nike", [{ bust: 90}, { waist: 74}, { hip: 98}]) ---');
// console.dir(listSizesFromDimensions("women", "Nike", [{ bust: 90}, { waist: 74}, { hip: 98}]), { depth: null, color: true });
