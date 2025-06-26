import { describe, expect, test } from "vitest";
import { parseComplexNumber } from "../Helper";

describe("parseComplexNumber Test", () => {
  test("empty string", () => {
    expect(parseComplexNumber("")).toBe(null);
  });

  test("0.4", () => {
    expect(parseComplexNumber("0.4")).toStrictEqual({
      real: 0.4,
      imaginary: 0,
    });
  });

  test("0.4i", () => {
    expect(parseComplexNumber("0.4i")).toStrictEqual({
      real: 0,
      imaginary: 0.4,
    });
  });

  test("0.2-0.5i", () => {
    expect(parseComplexNumber("0.2-0.5i")).toStrictEqual({
      real: 0.2,
      imaginary: -0.5,
    });
  });

  test("-0.2-0.5i", () => {
    expect(parseComplexNumber("-0.2-0.5i")).toStrictEqual({
      real: -0.2,
      imaginary: -0.5,
    });
  });

  test("0.2+0.5i", () => {
    expect(parseComplexNumber("0.2+0.5i")).toStrictEqual({
      real: 0.2,
      imaginary: 0.5,
    });
  });
});
