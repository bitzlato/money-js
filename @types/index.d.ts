declare module 'toformat' {
  import Big, { BigConstructor, BigSource } from 'big.js';

  export interface Format {
    /** The decimal separator. */
    decimalSeparator?: string;
    /** The grouping separator of the integer part. */
    groupSeparator?: string;
    /** The primary grouping size of the integer part. */
    groupSize?: number;
    /** The secondary grouping size of the integer part. */
    secondaryGroupSize?: number;
    /** The grouping separator of the fraction part. */
    fractionGroupSeparator?: string;
    /** The grouping size of the fraction part. */
    fractionGroupSize?: number;
  }

  interface BigWithToFormat extends Big {
    toFormat(format: Format): string;
    toFormat(decimalPlaces: number, format: Format): string;
    toFormat(decimalPlaces: number, roundMode: number, format: Format): string;
  }

  interface BigWithToFormatConstructor extends BigConstructor {
    new (value: BigSource | BigWithToFormat): BigWithToFormat;
    (value: BigSource | BigWithToFormat): BigWithToFormat;
    (): BigWithToFormatConstructor;
  }

  const toformat: (ctor: BigConstructor) => BigWithToFormatConstructor;

  export default toformat;
}
