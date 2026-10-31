/** A [min, max] measurement range in centimetres. */
export type Range = [min: number, max: number];

export type Gender = "men" | "women";

/** Measurement keys used in the shirt charts. */
export type ShirtMeasurement = "chest" | "bust" | "waist" | "hip";

/** Measurements for one size, e.g. { chest: [96, 104], waist: [81, 89] }. */
export type Dimensions = Partial<Record<ShirtMeasurement, Range>>;

/** Size label -> measurements, e.g. { M: { ... }, "L-Tall": { ... } }. */
export type BrandSizes = Record<string, Dimensions>;

/** Brand name -> sizes, e.g. { Nike: { ... }, Adidas: { ... } }. */
export type GenderData = Record<string, BrandSizes>;

/** One matched size, e.g. { M: { chest: [96, 102], ... } }. */
export type SizeMatch = Record<string, Dimensions>;

/**
 * Lookup functions return an error message string (not an exception) when the
 * gender, brand, size or measurement is not found.
 */
export interface Shirts {
  listAllData(): Record<Gender, GenderData>;
  /** Returns null for an unknown gender. */
  listGenderData(gender: Gender): GenderData | null;
  listBrands(gender: Gender): string[] | string;
  listSizesForBrand(gender: Gender, brand: string): BrandSizes | string;
  listDimensionsForSize(
    gender: Gender,
    brand: string,
    size: string
  ): Dimensions | string;
  /** Returns one [min, max] range when sizeType is given, else all dimensions. */
  listDimensionsForSizeType(
    gender: Gender,
    brand: string,
    size: string
  ): Dimensions | string;
  listDimensionsForSizeType(
    gender: Gender,
    brand: string,
    size: string,
    sizeType: ShirtMeasurement
  ): Range | string;
  /** Sizes where every given measurement (in cm) falls within range. */
  listSizesFromDimensions(
    gender: Gender,
    brand: string,
    dimensions: Array<Partial<Record<ShirtMeasurement, number>>>
  ): SizeMatch[] | string;
  /** US matches, best first; [] if none; error string if input not found. */
  mapSizeToUS(
    gender: Gender,
    brand: string,
    size: string,
    sizeType?: ShirtMeasurement
  ): SizeMatch[] | string;
}

export const shirts: Shirts;