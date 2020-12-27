/*
 # operations.ts
 # Attributive Operation Class
 */

/*
 # Module Imports
 */

/*
 # Operations
 */

// Basic Mathematical Operators

/**
 * Adds the values in the array.
 * @param a An array of numbers.
 */
function sum(a: number[]) {
  return a.reduce((l, n) => l + n);
}

/**
 * Subtracts the values in the array.
 * @param a An array of numbers.
 */
function difference(a: number[]) {
  return a.reduce((l, n) => l - n);
}

/**
 * Multiplies the values in the array.
 * @param a An array of numbers.
 */
function product(a: number[]) {
  return a.reduce((l, n) => l * n);
}

/**
 * Divides the values in the array.
 * @param a An array of numbers.
 */
function quotient(a: number[]) {
  return a.reduce((l, n) => l / n);
}

// Clamping Functions

/**
 * Returns the smallest number in the array.
 * @param a An array of numbers.
 */
function min(a: number[]) {
  return Math.min(...a);
}

/**
 * Returns the largest number in the array.
 * @param a An array of numbers.
 */
function max(a: number[]) {
  return Math.max(...a);
}

/**
 * Clamps the minimum value of the first number to the second.
 * @param a A Tuple: [value, min]
 */
function clampMin(a: [number, number]) {
  return a[0] < a[1] ? a[1] : a[0];
}

/**
 * Clamps the maximum value of the first number to the second.
 * @param a A Tuple: [value, max]
 */
function clampMax(a: [number, number]) {
  return a[0] > a[1] ? a[1] : a[0];
}

/**
 * Clamps the value of the first number between the second and third.
 * @param a A 3 element array: [value, min, max]
 */
function clamp(a: [number, number, number]) {
  return a[0] < a[1] ? a[1] : a[0] > a[2] ? a[2] : a[0];
}

// Rounding Functions

/**
 * Rounds the number down to the nearest integer.
 * @param a A 1 element array: [number]
 */
function floor(a: [number]) {
  return Math.floor(a[0]);
}

/**
 * Rounds the number up to the nearest integer.
 * @param a A 1 element array: [number]
 */
function ceil(a: [number]) {
  return Math.ceil(a[0]);
}

/**
 * Rounds the number to the nearest integer.
 * @param a A 1 element array: [number]
 */
function round(a: [number]) {
  return Math.round(a[0]);
}

//Statistical Functions

/**
 * Returns the average of the numbers in the array.
 * @param a An array of numbers.
 */
function average(a: number[]) {
  return sum(a) / a.length;
}

/*
 # Module Exports
 */

export const operations = {
  SUM: sum,
  DIF: difference,
  PRD: product,
  QUO: quotient,

  MIN: min,
  MAX: max,
  CLAMP_MIN: clampMin,
  CLAMP_MAX: clampMax,
  CLAMP: clamp,

  FLOOR: floor,
  CEIL: ceil,
  ROUND: round,

  AVG: average,
} as {
  [key: string]: (
    a: number[] | [number] | [number, number] | [number, number, number]
  ) => number;
};

// export const OperationType = Object.keys(operations)
//   .reduce((l, n) => ({ ...l, [n]: n.toUpperCase() }), {});

export type OperationKey = keyof typeof operations;
