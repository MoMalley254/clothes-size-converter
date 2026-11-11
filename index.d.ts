/** A [min, max] measurement range in centimetres. */
export type Range = [min: number, max: number];
export type Gender = "men" | "women";

/** All measurement keys used across garments. */
export type Measurement = "chest" | "bust" | "waist" | "hip" | "inseam" | "foot_length";
export type ShirtMeasurement = "chest" | "bust" | "waist" | "hip";
export type TrouserMeasurement = "waist" | "hip" | "inseam";
export type DressMeasurement = "bust" | "waist" | "hip";
export type ShoeMeasurement = "foot_length";
export type ShoeSystem = "EU" | "UK" | "US" | "Asia";

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

export interface Dresses {
  /** Women only: listGenderData("men") returns null. */
  listAllData(): Partial<Record<Gender, GenderData>>;
  listGenderData(gender: Gender): GenderData | null;
  listBrands(gender: Gender): string[] | string;
  listSizesForBrand(gender: Gender, brand: string): BrandSizes | string;
  listDimensionsForSize(gender: Gender, brand: string, size: string): Dimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string): Dimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string, sizeType: DressMeasurement): Range | string;
  listSizesFromDimensions(
    gender: Gender,
    brand: string,
    dimensions: Array<Partial<Record<DressMeasurement, number>>>
  ): SizeMatch[] | string;
  mapSizeToUS(
    gender: Gender,
    brand: string,
    size: string,
    sizeType?: DressMeasurement
  ): SizeMatch[] | string;
}

/** One row of the shoe size chart: the same shoe in every system. */
export type ShoeSizeRow = Record<ShoeSystem, number>;

export interface Shoes {
  listAllData(): Record<Gender, GenderData>;
  listGenderData(gender: Gender): GenderData | null;
  listBrands(gender: Gender): string[] | string;
  listSizesForBrand(gender: Gender, brand: string): BrandSizes | string;
  /** Brand charts are keyed by EU size, e.g. "42.5". */
  listDimensionsForSize(gender: Gender, brand: string, size: string): Dimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string): Dimensions | string;
  listDimensionsForSizeType(gender: Gender, brand: string, size: string, sizeType: ShoeMeasurement): Range | string;
  /** Sizes whose foot_length range (cm) contains the given value. */
  listSizesFromDimensions(
    gender: Gender,
    brand: string,
    dimensions: Array<Partial<Record<ShoeMeasurement, number>>>
  ): SizeMatch[] | string;
  /** US matches, best first; [] if none; error string if input not found. */
  mapSizeToUS(
    gender: Gender,
    brand: string,
    size: string,
    sizeType?: ShoeMeasurement
  ): SizeMatch[] | string;
  /** Every size in the EU / UK / US / Asia systems. */
  listSizeChart(gender: Gender): ShoeSizeRow[] | string;
  /** Convert between systems (system names are case-insensitive). */
  convertShoeSize(
    gender: Gender,
    from: ShoeSystem,
    size: number | string,
    to: ShoeSystem
  ): number | string;
}

export const shirts: Shirts;
export const trousers: Trousers;
export const shoes: Shoes;
export const dresses: Dresses;
