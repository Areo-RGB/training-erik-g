import { TableData, DataRow } from '../models/stats';

const createRow = (name: string, value: number, trend: 'up' | 'down' | 'neutral' = 'neutral'): DataRow => ({
  id: `${name.toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`,
  name,
  value,
  trend
});

export const generateTableData = (tableCount: number, rowCount: number): TableData[] => {
  return [
    {
      id: 'test-yoyo',
      title: 'YoYo IR1',
      headers: ['Name', 'Distanz'],
      valueType: 'distance',
      rows: [
        createRow('Max', 1360, 'up'),
        createRow('Finley', 1120, 'up'),
        createRow('Arvid', 1120, 'neutral'),
        createRow('Eray', 1000, 'down'),
        createRow('Levi', 1000, 'up'),
        createRow('Jakob', 920, 'neutral'),
        createRow('Finn', 880, 'down'),
        createRow('Lionel', 880, 'neutral'),
        createRow('Bent', 800, 'down'),
        createRow('Lion', 760, 'down'),
        createRow('Lasse', 600, 'neutral'),
        createRow('Berat', 560, 'down'),
        createRow('Silas', 480, 'neutral'),
        createRow('Metin', 400, 'down'),
        createRow('Paul', 400, 'down')
      ]
    },
    {
      id: 'test-springseil',
      title: 'Springseil 100/30s',
      headers: ['Name', 'Anzahl'],
      valueType: 'score',
      rows: [
        createRow('Max', 100, 'up'),
        createRow('Bent', 100, 'up'),
        createRow('Finley', 74, 'neutral'),
        createRow('Eray', 54, 'down'),
        createRow('Berat', 54, 'up'),
        createRow('Metin', 53, 'neutral'),
        createRow('Lion', 0, 'neutral'),
        createRow('Silas', 0, 'neutral'),
        createRow('Arvid', 0, 'neutral'),
        createRow('Jakob', 0, 'neutral'),
        createRow('Paul', 0, 'neutral'),
        createRow('Lennox', 0, 'neutral'),
        createRow('Levi', 0, 'neutral')
      ]
    },
    {
      id: 'test-prellwand',
      title: 'Prellwand 45/45s',
      headers: ['Name', 'Punkte'],
      valueType: 'score',
      rows: [
        createRow('Max', 45, 'up'),
        createRow('Bent', 41, 'up'),
        createRow('Lion', 40, 'up'),
        createRow('Berat', 39, 'neutral'),
        createRow('Finley', 32, 'down'),
        createRow('Metin', 31, 'down'),
        createRow('Eray', 30, 'down'),
        createRow('Silas', 0, 'neutral'),
        createRow('Arvid', 0, 'neutral'),
        createRow('Jakob', 0, 'neutral'),
        createRow('Paul', 0, 'neutral'),
        createRow('Lennox', 0, 'neutral'),
        createRow('Levi', 0, 'neutral')
      ]
    },
    {
      id: 'test-jonglieren',
      title: 'Jonglieren 100x',
      headers: ['Name', 'Anzahl'],
      valueType: 'score',
      rows: [
        createRow('Max', 100, 'up'),
        createRow('Bent', 100, 'up'),
        createRow('Lion', 100, 'up'),
        createRow('Silas', 52, 'up'),
        createRow('Eray', 47, 'down'),
        createRow('Metin', 39, 'neutral'),
        createRow('Berat', 32, 'down'),
        createRow('Finley', 31, 'down'),
        createRow('Arvid', 28, 'neutral'),
        createRow('Levi', 12, 'down'),
        createRow('Finn', 10, 'neutral'),
        createRow('Paul', 10, 'neutral'),
        createRow('Lennox', 10, 'neutral'),
        createRow('Lasse', 10, 'neutral')
      ]
    }
  ];
};