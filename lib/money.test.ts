import { test } from "node:test";
import assert from "node:assert/strict";
import { calcBreakdown, parseToSen, formatSen, parseKmTenths, senPerKm } from "./money.ts";

test("parseToSen", () => {
  assert.equal(parseToSen("12"), 1200);
  assert.equal(parseToSen("12.5"), 1250);
  assert.equal(parseToSen("12,50"), 1250);
  assert.equal(parseToSen("RM 7.05"), 705);
  assert.equal(parseToSen("0"), null);
  assert.equal(parseToSen("abc"), null);
  assert.equal(parseToSen("1.234"), null);
  assert.equal(parseToSen("-5"), null);
});

test("lalamove deducts 21%", () => {
  assert.deepEqual(calcBreakdown(5000, "lalamove"), {
    grossSen: 5000, commissionSen: 1050, netSen: 3950, ratePct: 21,
  });
  // 12.34 * 0.21 = 2.5914 -> 2.59 ; net 9.75
  assert.equal(calcBreakdown(1234, "lalamove").netSen, 975);
  // 0.50 * 0.21 = 0.105 -> 0.11 (round half up)
  assert.equal(calcBreakdown(50, "lalamove").commissionSen, 11);
});

test("grab has no deduction", () => {
  assert.equal(calcBreakdown(2350, "grab").netSen, 2350);
});

test("formatSen", () => {
  assert.match(formatSen(395050), /RM\s?3,950\.50/);
});


test("parseKmTenths", () => {
  assert.equal(parseKmTenths(""), undefined);
  assert.equal(parseKmTenths("12"), 120);
  assert.equal(parseKmTenths("12.5"), 125);
  assert.equal(parseKmTenths("3,2 km"), 32);
  assert.equal(parseKmTenths("0"), null);
  assert.equal(parseKmTenths("1.25"), null);
  assert.equal(parseKmTenths("abc"), null);
});

test("senPerKm", () => {
  // RM39.50 / 12.5km = RM3.16/km
  assert.equal(senPerKm(3950, 125), 316);
  assert.equal(senPerKm(1000, 0), null);
});
