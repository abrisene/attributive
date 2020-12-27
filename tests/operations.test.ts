/*
 # operations.test.js
 # Attributive Operations Tests
 */

/**
 # Module Dependencies
 */

import {operations} from '../src';

/**
 # Variables
 */

/**
 # Tests
 */

test('Basic mathematical operations work correctly.', () => {
  const {SUM, DIF, PRD, QUO} = operations;

  const a0 = [1];
  const a1 = [1, 2];
  const a2 = [1, 2, 3];

  const b0 = [3];
  const b1 = [3, 2];
  const b2 = [3, 2, 1];

  const c0 = [4];
  const c1 = [4, 2];
  const c2 = [4, 2, 1];

  expect(SUM(a0)).toEqual(1);
  expect(SUM(a1)).toEqual(3);
  expect(SUM(a2)).toEqual(6);

  expect(DIF(a0)).toEqual(1);
  expect(DIF(a1)).toEqual(-1);
  expect(DIF(a2)).toEqual(-4);

  expect(PRD(b0)).toEqual(3);
  expect(PRD(b1)).toEqual(6);
  expect(PRD(b2)).toEqual(6);

  expect(QUO(c0)).toEqual(4);
  expect(QUO(c1)).toEqual(2);
  expect(QUO(c2)).toEqual(2);
});

test('Clamping operations work correctly.', () => {
  const {MIN, MAX, CLAMP_MIN, CLAMP_MAX, CLAMP} = operations;
  const a0 = [3, 1, 5];
  const a1 = [0, 1, 5];
  const a2 = [9, 1, 5];

  expect(MIN(a0)).toEqual(1);
  expect(MIN(a1)).toEqual(0);
  expect(MIN(a2)).toEqual(1);

  expect(MAX(a0)).toEqual(5);
  expect(MAX(a1)).toEqual(5);
  expect(MAX(a2)).toEqual(9);

  expect(CLAMP_MIN(a0)).toEqual(3);
  expect(CLAMP_MIN(a1)).toEqual(1);
  expect(CLAMP_MIN(a2)).toEqual(9);

  expect(CLAMP_MAX(a0)).toEqual(1);
  expect(CLAMP_MAX(a1)).toEqual(0);
  expect(CLAMP_MAX(a2)).toEqual(1);

  expect(CLAMP(a0)).toEqual(3);
  expect(CLAMP(a1)).toEqual(1);
  expect(CLAMP(a2)).toEqual(5);
});

test('Rounding operations work correctly.', () => {
  const {FLOOR, CEIL, ROUND} = operations;
  const a0 = [0.2];
  const a1 = [3.6];
  const a2 = [5.3];

  expect(FLOOR(a0)).toEqual(0);
  expect(FLOOR(a1)).toEqual(3);
  expect(FLOOR(a2)).toEqual(5);

  expect(CEIL(a0)).toEqual(1);
  expect(CEIL(a1)).toEqual(4);
  expect(CEIL(a2)).toEqual(6);

  expect(ROUND(a0)).toEqual(0);
  expect(ROUND(a1)).toEqual(4);
  expect(ROUND(a2)).toEqual(5);
});

test('Statistical operations work correctly.', () => {
  const {AVG} = operations;
  const a0 = [1, 2, 3];
  const a1 = [50, 25, 15];
  const a2 = [500, 200, 5];

  expect(AVG(a0)).toEqual(2);
  expect(AVG(a1)).toEqual(30);
  expect(AVG(a2)).toEqual(235);
});
