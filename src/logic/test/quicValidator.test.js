import { expect, test } from "vitest";
import { Quic } from "../Quic";

// Test case for Quic.quicValidator

test("Quic.quicValidator Test empty", () => {
  expect(Quic.quicValidator("")).toBe(false);
});

test("Quic.quicValidator Test H", () => {
  expect(Quic.quicValidator("H")).toBe(true);
});

test("Quic.quicValidator Test O", () => {
  expect(Quic.quicValidator("O")).toBe(false);
});

test("Quic.quicValidator Test HO", () => {
  expect(Quic.quicValidator("HO")).toBe(false);
});

test("Quic.quicValidator Test HH,HH", () => {
  expect(Quic.quicValidator("HH,HH")).toBe(true);
});

test("Quic.quicValidator Test HH,HH.", () => {
  expect(Quic.quicValidator("HH,HH.")).toBe(true);
});

test("Quic.quicValidator Test HH,OH.", () => {
  expect(Quic.quicValidator("HH,OH.")).toBe(false);
});
