import { expect, test } from "vitest";
import { controlledGates, processColumnForControlled } from "../Helper";

test("Controlled Test [empty]", () => {
  expect(processColumnForControlled([])).toBe(null);
});

test("Controlled Test H", () => {
  expect(processColumnForControlled(["H"])).toBe(null);
});

test("Controlled Test C", () => {
  expect(processColumnForControlled(["C"])).toBe(null);
});

test("Controlled Test CN", () => {
  expect(processColumnForControlled(["C", "N"])).toStrictEqual({
    first: 0,
    last: 1,
  });
});

controlledGates.forEach((gate) => {
  test("Controlled Test C" + gate, () => {
    expect(processColumnForControlled(["C", gate])).toStrictEqual({
      first: 0,
      last: 1,
    });
  });

  test(`Controlled Test ${gate}C`, () => {
    expect(processColumnForControlled([gate, "C"])).toStrictEqual({
      first: 0,
      last: 1,
    });
  });
});

test("Controlled Test HCN", () => {
  expect(processColumnForControlled(["H", "C", "N"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});

test("Controlled Test NC", () => {
  expect(processColumnForControlled(["C", "N"])).toStrictEqual({
    first: 0,
    last: 1,
  });
});

test("Controlled Test HNC", () => {
  expect(processColumnForControlled(["H", "N", "C"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});

test("Controlled Test CCN", () => {
  expect(processColumnForControlled(["C", "C", "N"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});

test("Controlled Test CCH", () => {
  expect(processColumnForControlled(["C", "C", "H"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});

test("Controlled Test NCC", () => {
  expect(processColumnForControlled(["N", "C", "C"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});

test("Controlled Test NCN", () => {
  expect(processColumnForControlled(["N", "C", "N"])).toStrictEqual({
    first: 0,
    last: 2,
  });
});
