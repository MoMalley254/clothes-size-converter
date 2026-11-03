/** A [min, max] measurement range in centimetres. */
export type Range = [min: number, max: number];
export type Gender = "men" | "women";

/** All measurement keys used across garments. */
export type Measurement = "chest" | "bust" | "waist" | "hip" | "inseam";
export type ShirtMeasurement = "chest" | "bust" | "waist" | "hip";
export type TrouserMeasurement = "waist" | "hip" | "inseam";

export type Dimensions = Partial<Record<Measurement, Range>>;
export type TrouserDimensions = Partial<Record<TrouserMeasurement, Range>>;
export type BrandSizes = Record<string, Dimensions>;
export type GenderData = Record<string, BrandSizes>;
export type SizeMatch = Record<string, Dimensions>;
export type TrouserSizeMatch = Record<string, TrouserDimensions>;

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

export interface Trousers {
  listAllData(): Record<Gender, GenderData>;
  listGenderData(gender: Gender): GenderData | null;
  listBrands(gender: Gender): string[] | string;
  listSizesForBrand(gender: Gender, brand: string): BrandSizes | string;
  listDimensionsForSize(gender: Gender, brand: string, size: string): TrouserDimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string): TrouserDimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string, sizeType: TrouserMeasurement): Range | string;
  listSizesFromDimensions(
    gender: Gender,
    brand: string,
    dimensions: Array<Partial<Record<TrouserMeasurement, number>>>
  ): TrouserSizeMatch[] | string;
  mapSizeToUS(
    gender: Gender,
    brand: string,
    size: string,
    sizeType?: TrouserMeasurement
  ): TrouserSizeMatch[] | string;
}

export const shirts: Shirts;
export const trousers: Trousers;