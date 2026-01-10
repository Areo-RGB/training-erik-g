export interface HistoryEntry {
  date: string;
  value: number;
}

export interface DataRow {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  history?: HistoryEntry[];
}

export interface TableData {
  id: string;
  title: string;
  rows: DataRow[];
  headers?: [string, string];
  valueType?: 'currency' | 'distance' | 'time' | 'weight' | 'score';
}