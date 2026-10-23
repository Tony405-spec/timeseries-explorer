import { TimeSeriesData } from '../types';

const escapeCsv = (value: string | number): string =>
  `"${String(value).replace(/"/g, '""')}"`;

export const serializeTimeSeriesCsv = (dataset: Pick<TimeSeriesData, 'data'>): string => {
  const rows = [
    ['timestamp', 'value'],
    ...dataset.data.map(({ timestamp, value }) => [timestamp, value]),
  ];

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n') + '\r\n';
};
