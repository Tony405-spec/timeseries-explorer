import { describe, expect, it } from 'vitest';
import { serializeTimeSeriesCsv } from './dataExport';

describe('serializeTimeSeriesCsv', () => {
  it('writes a quoted header and numeric values', () => {
    expect(serializeTimeSeriesCsv({
      data: [{ timestamp: '2024-01-01', value: 12.5 }],
    })).toBe('"timestamp","value"\r\n"2024-01-01","12.5"\r\n');
  });

  it('escapes quotes, commas, and line breaks in timestamps', () => {
    expect(serializeTimeSeriesCsv({
      data: [{ timestamp: 'date, "local"\nsecond line', value: -2 }],
    })).toBe('"timestamp","value"\r\n"date, ""local""\nsecond line","-2"\r\n');
  });

  it('emits a valid header for an empty dataset', () => {
    expect(serializeTimeSeriesCsv({ data: [] })).toBe('"timestamp","value"\r\n');
  });
});
