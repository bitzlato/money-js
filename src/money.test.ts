import Big from 'big.js';

import { Money } from './money';

const USD = {
  code: 'USD',
  minorUnit: 2,
};

const BTC = {
  code: 'BTC',
  minorUnit: 8,
};

const JPY = {
  code: 'JPY',
  minorUnit: 0,
};

const UNKNOWN = {
  code: 'UNKNOWN',
  minorUnit: 1,
};

describe('Money', () => {
  test('should create money object', () => {
    const amount = new Big(10);
    const money = new Money(amount, USD);

    expect(money.amount).toEqual(amount);
    expect(money.currency).toEqual(USD);
  });

  test('should create from cents using `Money.fromCents()`', () => {
    const money = Money.fromCents(1_000, USD);

    expect(money.toString()).toEqual('10.00');
    expect(money.currency).toEqual(USD);
  });

  test('should create from decimal using `Money.fromDecimal()`', () => {
    const money = Money.fromDecimal(10.01, USD);
    const money1 = Money.fromDecimal(10.1, USD);
    const money2 = Money.fromDecimal(10, USD);
    const money3 = Money.fromDecimal(10.2365, USD);
    const money4 = Money.fromDecimal('10.1', USD);
    const money5 = Money.fromDecimal('10.00000100', BTC);

    expect(money.toString()).toEqual('10.01');
    expect(money.currency).toEqual(USD);
    expect(money1.toString()).toEqual('10.10');
    expect(money2.toString()).toEqual('10.00');
    expect(money3.toString()).toEqual('10.24');
    expect(money4.toString()).toEqual('10.10');
    expect(money5.toString()).toEqual('10.00000100');
  });

  test('should add same currencies correctly', () => {
    const first = Money.fromCents(1_000, USD);
    const second = Money.fromCents(500, USD);

    const money = first.add(second);

    expect(money.toString()).toEqual('15.00');
    expect(money.currency).toEqual(USD);

    expect(first.toString()).toEqual('10.00');
    expect(second.toString()).toEqual('5.00');
  });

  test('should not add different currencies', () => {
    const first = Money.fromCents(1_000, USD);
    const second = Money.fromCents(500, BTC);

    expect(() => {
      first.add(second);
    }).toThrow('Different currencies');
  });

  test('should compare correctly', () => {
    const subject = Money.fromCents(1_000, USD);
    const bigger = Money.fromCents(1_500, USD);
    const smaller = Money.fromCents(500, USD);
    const equal = Money.fromDecimal(10, USD);
    const bitcoin = Money.fromCents(1_000, BTC);

    expect(subject.compare(bigger)).toEqual(-1);
    expect(subject.compare(smaller)).toEqual(1);
    expect(subject.compare(equal)).toEqual(0);

    expect(subject.lessThan(bigger)).toEqual(true);
    expect(subject.lessThan(equal)).toEqual(false);
    expect(subject.lessThanOrEqual(equal)).toEqual(true);
    expect(subject.lessThanOrEqual(smaller)).toEqual(false);

    expect(subject.greaterThan(smaller)).toEqual(true);
    expect(subject.greaterThan(equal)).toEqual(false);
    expect(subject.greaterThanOrEqual(equal)).toEqual(true);
    expect(subject.greaterThanOrEqual(bigger)).toEqual(false);

    expect(subject.equals(equal)).toEqual(true);
    expect(subject.equals(bigger)).toEqual(false);
    expect(subject.eq(equal)).toEqual(true);

    expect(() => {
      subject.compare(bitcoin);
    }).toThrow('Different currencies');

    expect(() => {
      subject.equals(bitcoin);
    }).not.toThrow();
    expect(subject.equals(bitcoin)).toEqual(false);
  });

  test('should subtract same currencies correctly', () => {
    const subject = Money.fromCents(1_000, USD);
    const money = subject.subtract(Money.fromCents(250, USD));

    expect(money.toString()).toEqual('7.50');
  });

  test('should multiply correctly', () => {
    const subject = Money.fromCents(1_000, USD);
    const money = subject.multiply(1.2234);

    expect(money.toString()).toEqual('12.23');
  });

  test('should divide correctly', () => {
    const subject = Money.fromCents(1_000, USD);
    const money = subject.divide(5);

    expect(money.toString()).toEqual('2.00');
    expect(money.currency).toEqual(USD);
  });

  test('should return amount as a string', () => {
    const money = Money.fromCents(1_010, USD);

    expect(money.toString()).toEqual('10.10');
  });

  test('should return amount in cents', () => {
    const money = Money.fromCents(1_010, USD);

    expect(money.multiply(2).toCents()).toEqual('2020');
  });

  test('should convert correctly', () => {
    const subject = Money.fromCents(100_000_000, BTC);
    const money = subject.convert(63_547, USD);

    expect(money.toString()).toEqual('63547.00');
    expect(money.currency).toEqual(USD);
  });

  test('`is` methods should returns correct boolean value', () => {
    const zero = Money.fromCents(0, USD);
    const notZero = Money.fromCents(1, USD);
    const negative = Money.fromCents(-101, USD);
    const positive = Money.fromCents(101, USD);

    expect(zero.isZero()).toEqual(true);
    expect(zero.isNegative()).toEqual(false);
    expect(zero.isPositive()).toEqual(true);
    expect(notZero.isZero()).toEqual(false);
    expect(negative.isNegative()).toEqual(true);
    expect(negative.isPositive()).toEqual(false);
    expect(positive.isPositive()).toEqual(true);
    expect(positive.isNegative()).toEqual(false);
  });

  test('should return the formatted amount', () => {
    expect(Money.fromCents(12_340_000_000, USD).toFormat()).toEqual('123,400,000.00');
    expect(Money.fromDecimal('1000.00010000', BTC).toFormat()).toEqual('1,000.0001');
    expect(Money.fromDecimal('10230.0', BTC).toFormat()).toEqual('10,230.00');
    expect(Money.fromDecimal('1000000', BTC).toFormat()).toEqual('1,000,000.00');
    expect(
      Money.fromDecimal('1000000', BTC).toFormat({
        decimalSeparator: ',',
        groupSeparator: ' ',
      }),
    ).toEqual('1 000 000,00');
    expect(Money.fromDecimal('43123', JPY).toFormat()).toEqual('43,123');
    expect(Money.fromDecimal('123.123456', BTC).toFormat({ maxFractionDigits: 4 })).toEqual(
      '123.1235',
    );
    expect(Money.fromDecimal('12.128', USD).toFormat()).toEqual('12.13');
    expect(
      Money.fromDecimal('0.128345', USD).toFormat({
        maxFractionDigits: 6,
      }),
    ).toEqual('0.13');
    expect(
      Money.fromDecimal('43.55', USD).toFormat({ maxFractionDigits: 1, minFractionDigits: 0 }),
    ).toEqual('43.6');
    expect(Money.fromDecimal('143.66', UNKNOWN).toFormat()).toEqual('143.7');
    expect(Money.fromDecimal('143', UNKNOWN).toFormat()).toEqual('143.0');
  });

  test('should remove trailing zeros', () => {
    expect(Money.fromDecimal('0.00010000', BTC).toFormat()).toEqual('0.0001');
    expect(Money.fromDecimal('123.0', BTC).toFormat()).toEqual('123.00');
    expect(Money.fromDecimal('10.00000001', BTC).toFormat()).toEqual('10.00000001');
    expect(Money.fromDecimal('43', BTC).toFormat()).toEqual('43.00');
    expect(Money.fromDecimal('43', JPY).toFormat()).toEqual('43');
  });

  test('should NOT remove trailing zeros', () => {
    expect(
      Money.fromDecimal('0.00010000', BTC).toFormat({ removeTrailingFractionalZeros: false }),
    ).toEqual('0.00010000');
    expect(
      Money.fromDecimal('123.0111', BTC).toFormat({ removeTrailingFractionalZeros: false }),
    ).toEqual('123.01110000');
  });
});
