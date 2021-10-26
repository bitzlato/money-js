# @bitzlato/money-js

This is a small library for working with monetary values. Based on [big.js](https://github.com/MikeMcl/big.js/) and follows [Martin Fowler's Money Type](https://martinfowler.com/eaaCatalog/money.html).

## Install

    npm i @bitzlato/money-js

## Usage

### Creating a money object

The library does not contain information about currencies, you have to define them yourself.

```typescript
const USD: Currency = {
  code: 'USD',
  minorUnit: 2,
};

const BTC: Currency = {
  code: 'BTC',
  minorUnit: 8,
};
```

```typescript
import { Money } from '@bitzlato/money-js';

// Money.fromDecimal(amount: number | string, currency: Currency, roundingMode?: RoundingMode) => Money
const dollars = Money.fromDecimal(10.25, USD);
const bitcoins = Money.fromDecimal('0.05316732', BTC);
// Money.toCents() => string
bitcoins.toCents(); // '5316732'

// Money.fromCents(amount: number | string, currency: Currency, roundingMode?: RoundingMode) => Money
const tenDollars = Money.fromCents(1000, USD);
const fiveBitcoins = Money.fromCents('500000000', BTC);
// Money.toString() => string
fiveBitcoins.toString(); // '5.00000000'

// new Money(amount: Big, currency: Currency, roundingMode?: RoundingMode) => Money
const fiveDollars = new Money(new Big('5'), USD);
// Money.toJSON() => { amount: string; currency: Currency }
JSON.stringify(fiveDollars); // '{"amount":"5.00","currency":{"code":"USD","minorUnit":2}}'
```

### Arithmetic

```typescript
const tenDollars = Money.fromCents(1_000, USD);

// Money.add(money: Money) => Money
tenDollars.add(Money.fromCents(250, USD)); // 12.50 USD

// Money.subtract(money: Money) => Money
tenDollars.subtract(Money.fromCents(250, USD)); // 7.50 USD

// Money.multiply(multiplier: Big | string | number) => Money
tenDollars.multiply(2.5); // 25.00 USD

// Money.divide(divisor: Big | string | number) => Money
tenDollars.divide(2.5); // 4 USD
```

Adding or subtracting different currencies will cause an error:

```typescript
Money.fromCents(1_000, USD).add(Money.fromCents(200_000, BTC)); // Error: Different currencies
```

### Comparing

```typescript
const tenDollars = Money.fromCents(1_000, USD);
const bigger = Money.fromCents(1_500, USD);
const smaller = Money.fromCents(500, USD);
const equal = Money.fromDecimal(10, USD);
const bitcoins = Money.fromCents(200_000, BTC);

// Money.equals(money: Money) => boolean
// Money.eq(money: Money) => boolean
tenDollars.equals(bitcoins); // false
tenDollars.equals(equal); // true

// Money.compare(money: Money) => -1 | 0 | 1
tenDollars.compare(bigger); // -1
tenDollars.compare(smaller); // 1
tenDollars.compare(equal); // 0
tenDollars.compare(bitcoins); // Error: Different currencies

// Money.lessThan(money: Money) => boolean
// Money.lt(money: Money) => boolean
tenDollars.lessThan(bigger); // true
// Money.lessThanOrEqual(money: Money) => boolean
// Money.lte(money: Money) => boolean
tenDollars.lessThanOrEqual(equal); // true
tenDollars.lessThanOrEqual(smaller); // false

// Money.greaterThan(money: Money) => boolean
// Money.gt(money: Money) => boolean
tenDollars.greaterThan(smaller); // true
// Money.greaterThanOrEqual(money: Money) => boolean
// Money.gte(money: Money) => boolean
tenDollars.greaterThanOrEqual(equal); // true
tenDollars.greaterThanOrEqual(bigger); // false
```

### Asserts

```typescript
// Money.isZero() => boolean
Money.fromCents(0, USD).isZero(); // true
Money.fromCents(100, USD).isZero(); // false

// Money.isPositive() => boolean
// Money.isNegative() => boolean
const dollars = Money.fromCents(-100, USD);
dollars.isPositive(); // false
dollars.isNegative(); // true
const zero = Money.fromCents(0, USD);
zero.isNegative(); // false
zero.isPositive(); // true
```

### Convert

```typescript
Money.fromCents(100_000_000, BTC).convert(60_737, USD).toString(); // '60737.00'
```

### Formatting

```typescript
// Money.toFormat(formatOptions?: FormatOptions) => string
Money.fromCents(12_340_000_000, USD).toFormat(); // '123,400,000.00'
Money.fromDecimal('1000.00010000', BTC).toFormat(); // '1,000.0001'
Money.fromDecimal('10230.0', BTC).toFormat(); // '10,230.00'
Money.fromDecimal('1000000', BTC).toFormat(); // '1,000,000.00'
```

Formatting options:

```typescript
interface FormatOptions {
  // The minimum number of displayed fraction digits
  minFractionDigits?: number; // default: 2
  // The maximum number of displayed fraction digits
  maxFractionDigits?: number; // default: 20
  // The flag whether to remove the trailing fractional zeros
  removeTrailingFractionalZeros?: boolean; // default: true
  // The decimal separator
  decimalSeparator?: string; //
  // The grouping separator of the integer part
  groupSeparator?: string;
  // The primary grouping size of the integer part
  groupSize?: number;
  // The secondary grouping size of the integer part
  secondaryGroupSize?: number;
  // The grouping separator of the fraction part
  fractionGroupSeparator?: string;
  // The grouping size of the fraction part
  fractionGroupSize?: number;
}
```

```typescript
const bitcoins = Money.fromDecimal('1330000.128345', BTC);
const dollars = Money.fromDecimal('0.128345', USD);

bitcoins.toFormat({
  decimalSeparator: ',',
  groupSeparator: ' ',
}); // '1 330 000,128345'
bitcoins.toFormat({ maxFractionDigits: 4 }); // '1,330,000.1283'
dollars.toFormat({ maxFractionDigits: 6 }); // '0.13'
dollars.toFormat({ minFractionDigits: 0, maxFractionDigits: 1 }); // '0.1'
bitcoins.toFormat({ removeTrailingFractionalZeros: false }); // 1,330,000.12834500
```

### Rounding

- `Money.ROUND_HALF_UP`
- `Money.ROUND_HALF_EVEN` - The default. [Bankers Rounding](http://wiki.c2.com/?BankersRounding).
- `Money.ROUND_DOWN`
- `Money.ROUND_UP`

You can specify any of these roundings when creating:

```typescript
Money.fromDecimal(10.2548, USD, Money.ROUND_UP).toString(); // '10.26'
```

## Test

    npm test

## License

[MIT](LICENSE).
