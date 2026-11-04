import { test } from "node:test";
import assert from "node:assert/strict";
import { calcBreakdown, parseToSen, formatSen } from "./money.ts";

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

test("lalamove tolak 21%", () => {
  assert.deepEqual(calcBreakdown(5000, "lalamove"), {
    grossSen: 5000, commissionSen: 1050, netSen: 3950, ratePct: 21,
  });
  // 12.34 * 0.21 = 2.5914 -> 2.59 ; bersih 9.75
  assert.equal(calcBreakdown(1234, "lalamove").netSen, 975);
  // 0.50 * 0.21 = 0.105 -> 0.11 (separuh ke atas)
  assert.equal(calcBreakdown(50, "lalamove").commissionSen, 11);
});

test("grab tiada potongan", () => {
  assert.equal(calcBreakdown(2350, "grab").netSen, 2350);
});

test("formatSen", () => {
  assert.match(formatSen(395050), /RM\s?3,950\.50/);
});
