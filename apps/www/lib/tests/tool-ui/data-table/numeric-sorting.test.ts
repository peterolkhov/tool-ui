import { describe, expect, test } from "vitest";

import { parseNumericLike, sortData } from "@/components/tool-ui/data-table";

const byteSuffixes = ["KB", "MB", "GB", "TB", "PB"] as const;

describe("DataTable numeric suffix parsing", () => {
  test.each(byteSuffixes)(
    "parses decimal-comma coefficients before %s",
    (suffix) => {
      const multiplier = 1024 ** (byteSuffixes.indexOf(suffix) + 1);
      for (const [coefficient, value] of [
        ["1,25", 1.25],
        ["0,125", 0.125],
        ["1234,125", 1234.125],
      ] as const) {
        expect(parseNumericLike(`${coefficient}${suffix}`)).toBe(
          value * multiplier,
        );
        expect(parseNumericLike(`-${coefficient}${suffix}`)).toBe(
          -value * multiplier,
        );
        expect(parseNumericLike(`(€${coefficient}${suffix})`)).toBe(
          -value * multiplier,
        );
      }
    },
  );

  test.each([
    ["0,125K", 125],
    ["0,125M", 125000],
    ["0,125G", 125000000],
    ["0,125T", 125000000000],
    ["0,125P", 125000000000000],
  ])("parses decimal-comma compact coefficient %s", (input, expected) => {
    expect(parseNumericLike(input as string)).toBe(expected);
  });

  test.each([
    ["1.25MB", 1.25 * 1024 ** 2],
    ["1,5MB", 1.5 * 1024 ** 2],
    ["1,234MB", 1234 * 1024 ** 2],
    ["1,234,567MB", 1234567 * 1024 ** 2],
    ["1.234,56MB", 1234.56 * 1024 ** 2],
    ["1,234.56MB", 1234.56 * 1024 ** 2],
    ["1.234MB", 1.234 * 1024 ** 2],
    ["1,250M", 1250 * 1e6],
    ["1,25M", 1.25 * 1e6],
    ["1,234,567M", 1234567 * 1e6],
    ["$1,234.56", 1234.56],
    ["(£1.234,56)", -1234.56],
    ["1 234,56", 1234.56],
    ["1,234", 1234],
    ["1.234", 1234],
    ["0,125", 0.125],
    ["-12.5", -12.5],
    ["50%", 50],
    ["768B", 768],
    ["1024B", 1024e9],
    ["1.5B", 1.5e9],
    ["1,5B", 1.5e9],
    ["2.8T", 2.8e12],
    ["1e3", null],
    ["1,25MiB", null],
    ["1,25MB/s", null],
    ["1,25widgets", null],
    ["NaN", null],
    ["Infinity", null],
    ["", null],
    ["hello", null],
  ])("preserves existing parsing of %s", (input, expected) => {
    expect(parseNumericLike(input as string)).toBe(expected);
  });
});

describe("DataTable numeric suffix sorting", () => {
  const rows = [
    { id: "small", size: "1,25MB" },
    { id: "large", size: "2MB" },
    { id: "missing", size: null },
  ];

  test.each(
    [undefined, "de-DE", "en-US"].flatMap((locale) =>
      (["asc", "desc"] as const).map((direction) => ({ locale, direction })),
    ),
  )("sorts $direction with locale $locale", ({ locale, direction }) => {
    const expected =
      direction === "asc"
        ? ["small", "large", "missing"]
        : ["large", "small", "missing"];
    expect(
      sortData(rows, "size", direction, locale).map((row) => row.id),
    ).toEqual(expected);
    expect(rows.map((row) => row.id)).toEqual(["small", "large", "missing"]);
  });

  test("keeps nonnumeric string collation", () => {
    const names = [{ name: "item10" }, { name: "item2" }];
    expect(sortData(names, "name", "asc").map((row) => row.name)).toEqual([
      "item2",
      "item10",
    ]);
  });
});
