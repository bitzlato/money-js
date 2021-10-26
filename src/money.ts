import Big, { BigSource, Comparison, RoundingMode } from 'big.js';
import toFormat from 'toformat';

export interface Currency {
  code: string;
  minorUnit: number;
}

export interface FormatOptions {
  // The minimum number of displayed fraction digits
  minFractionDigits?: number; // default: 2
  // The maximum number of displayed fraction digits
  maxFractionDigits?: number; // default: 20
  // The flag whether to remove the trailing fractional zeros
  removeTrailingFractionalZeros?: boolean; // default: true
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

interface MoneyJSON {
  amount: string;
  currency: Currency;
}

const DEFAULT_ROUND_MODE = Big.roundHalfUp;

const BigWithToFormat = toFormat(Big);

const assertSameCurrency = (a: Money, b: Money): void => {
  if (a.currency.code !== b.currency.code) {
    throw new Error('Different currencies');
  }
};

export const defaultFormatOptions: Required<FormatOptions> = {
  minFractionDigits: 2,
  maxFractionDigits: 20,
  removeTrailingFractionalZeros: true,
  // next options from toformat.Format
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
};

export class Money {
  static ROUND_HALF_UP = Big.roundHalfUp;
  static ROUND_HALF_EVEN = Big.roundHalfEven;
  static ROUND_DOWN = Big.roundDown;
  static ROUND_UP = Big.roundUp;

  static fromCents(
    cents: number | string,
    currency: Currency,
    roundingMode: RoundingMode = DEFAULT_ROUND_MODE,
  ): Money {
    return new Money(new Big(cents).div(`1e${currency.minorUnit}`), currency, roundingMode);
  }

  static fromDecimal(
    amount: number | string,
    currency: Currency,
    roundingMode: RoundingMode = DEFAULT_ROUND_MODE,
  ): Money {
    return new Money(new Big(amount), currency, roundingMode);
  }

  amount: Big;
  currency: Currency;
  roundingMode: RoundingMode;

  constructor(amount: Big, currency: Currency, roundingMode: RoundingMode = DEFAULT_ROUND_MODE) {
    this.amount = amount;
    this.currency = currency;
    this.roundingMode = roundingMode;
  }

  toString(): string {
    return this.amount.toFixed(this.currency.minorUnit, this.roundingMode);
  }

  toJSON(): MoneyJSON {
    return {
      amount: this.toString(),
      currency: this.currency,
    };
  }

  toCents(): string {
    return this.amount.times(`1e${this.currency.minorUnit}`).round(0, this.roundingMode).toString();
  }

  convert(rate: BigSource, toCurrency: Currency): Money {
    return new Money(this.amount.times(rate), toCurrency);
  }

  add(money: Money): Money {
    assertSameCurrency(this, money);

    return new Money(this.amount.plus(money.amount), this.currency);
  }

  subtract(money: Money): Money {
    assertSameCurrency(this, money);

    return new Money(this.amount.minus(money.amount), this.currency);
  }

  multiply(multiplier: BigSource): Money {
    return new Money(this.amount.times(multiplier), this.currency);
  }

  divide(divisor: BigSource): Money {
    return new Money(this.amount.div(divisor), this.currency);
  }

  compare(money: Money): Comparison {
    assertSameCurrency(this, money);

    return this.amount.cmp(money.amount);
  }

  equals(money: Money): boolean {
    if (this.currency.code !== money.currency.code) {
      return false;
    }

    return this.compare(money) === 0;
  }

  eq = this.equals;

  greaterThan(money: Money): boolean {
    return this.compare(money) === 1;
  }

  gt = this.greaterThan;

  greaterThanOrEqual(money: Money): boolean {
    return this.compare(money) >= 0;
  }

  gte = this.greaterThanOrEqual;

  lessThan(money: Money): boolean {
    return this.compare(money) === -1;
  }

  lt = this.lessThan;

  lessThanOrEqual(money: Money): boolean {
    return this.compare(money) <= 0;
  }

  lte = this.lessThanOrEqual;

  isZero(): boolean {
    return this.amount.eq(0);
  }

  isPositive(): boolean {
    return this.amount.s > 0;
  }

  isNegative(): boolean {
    return this.amount.s < 0;
  }

  toFormat(options?: FormatOptions): string {
    const formatOptions = {
      ...defaultFormatOptions,
      ...options,
    };
    let decimalPlaces = 0;
    if (this.currency.minorUnit > 0) {
      const [, fractional = ''] = this.amount.toString().split('.') as [string, string | undefined];
      const fractionalLength = formatOptions.removeTrailingFractionalZeros
        ? fractional?.replace(/0+$/, '').length
        : this.currency.minorUnit;
      decimalPlaces = Math.min(
        Math.max(fractionalLength, formatOptions.minFractionDigits),
        Math.min(this.currency.minorUnit, formatOptions.maxFractionDigits),
      );
    }

    const big = new BigWithToFormat(this.amount);
    return big.toFormat(decimalPlaces, this.roundingMode, formatOptions);
  }
}
