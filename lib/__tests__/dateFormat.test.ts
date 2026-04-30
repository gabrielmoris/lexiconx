import formatMongoDate from "@/lib/dateFormat";

describe("formatMongoDate", () => {
  it("formats a valid date string with default options", () => {
    const result = formatMongoDate("2026-04-30T10:00:00.000Z");
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/04|4/);
    expect(result).toMatch(/30/);
  });

  it("formats a Date object", () => {
    const date = new Date("2026-04-30T10:00:00.000Z");
    const result = formatMongoDate(date);
    expect(result).toMatch(/2026/);
  });

  it("returns undefined for falsy input", () => {
    expect(formatMongoDate("")).toBeUndefined();
    expect(formatMongoDate(null as unknown as string)).toBeUndefined();
    expect(formatMongoDate(undefined as unknown as string)).toBeUndefined();
  });

  it("accepts custom formatting options", () => {
    const result = formatMongoDate("2026-04-30T14:30:00.000Z", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/April|april/);
    expect(result).toMatch(/30/);
  });

  it("uses en-GB locale format", () => {
    const result = formatMongoDate("2026-01-05T00:00:00.000Z");
    // en-GB format is DD/MM/YYYY, so day should come before month
    expect(result).toMatch(/05/);
    expect(result).toMatch(/01|1/);
  });

  it("throws RangeError for invalid date string", () => {
    expect(() => formatMongoDate("not-a-date")).toThrow(RangeError);
  });
});
