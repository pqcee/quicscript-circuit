import { describe, expect, test } from "vitest";
import { controlledGates, processColumnForSwap } from "../Helper";

describe("processColumnForSwap Test", () => {
  test("[empty]", () => {
    expect(processColumnForSwap([])).toBe(null);
  });

  test("['H']", () => {
    expect(processColumnForSwap(["H"])).toBe(null);
  });

  test("['s']", () => {
    expect(processColumnForSwap(["s"])).toBe(null);
  });

  test("['s','s']", () => {
    expect(processColumnForSwap(["s", "s"])).toStrictEqual({
      first: 0,
      last: 1,
    });
  });

  test("['H','s','s']", () => {
    expect(processColumnForSwap(["H", "s", "s"])).toStrictEqual({
      first: 1,
      last: 2,
    });
  });

  test("['H','s','H','s']", () => {
    expect(processColumnForSwap(["H", "s", "H", "s"])).toStrictEqual({
      first: 1,
      last: 3,
    });
  });
});
