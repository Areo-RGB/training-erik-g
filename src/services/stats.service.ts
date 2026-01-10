import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, child, update } from 'firebase/database';
import { TableData, HistoryEntry } from '../models/stats';
import { generateTableData } from '../utils/data';
import { Observable, BehaviorSubject } from 'rxjs';

const firebaseConfig = {
  apiKey: "AIzaSyDcR7KzILxjXrIqe7Xe9v33C9QugQbjLuM",
  authDomain: "multi-e4d82.firebaseapp.com",
  databaseURL: "https://multi-e4d82-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "multi-e4d82",
  storageBucket: "multi-e4d82.firebasestorage.app",
  messagingSenderId: "302955593473",
  appId: "1:302955593473:web:2a6e6da2fe88a7457b6500",
  measurementId: "G-N97TTYCF61"
};

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private app = initializeApp(firebaseConfig);
  private db = getDatabase(this.app);
  
  private tablesSubject = new BehaviorSubject<TableData[]>([]);
  public tables$ = this.tablesSubject.asObservable();

  constructor() {
    this.subscribeToData();
  }

  private subscribeToData() {
    const dataRef = ref(this.db, 'tables');
    
    // Check if empty first to seed
    get(dataRef).then((snapshot) => {
      if (!snapshot.exists()) {
        console.log("Seeding initial data to Firebase...");
        const initialData = generateTableData(5, 10);
        set(dataRef, initialData);
      }
    }).catch(err => console.error("Error checking DB:", err));

    // Subscribe to changes
    onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Ensure we always return an array
        this.tablesSubject.next(Object.values(val) as TableData[]);
      } else {
        this.tablesSubject.next([]);
      }
    });
  }

  async updateMetricEntry(tableId: string, personName: string, newValue: number) {
    const dbRef = ref(this.db);
    
    try {
      const snapshot = await get(child(dbRef, 'tables'));
      if (!snapshot.exists()) return;

      const tables = snapshot.val() as TableData[];
      // Find the table index (Firebase arrays are objects with integer keys)
      const tableIndex = Object.keys(tables).find(key => tables[parseInt(key)].id === tableId);
      
      if (!tableIndex) throw new Error("Table not found");

      const table = tables[parseInt(tableIndex)];
      const rowIndex = table.rows.findIndex(r => r.name === personName);

      if (rowIndex === -1) {
        throw new Error("Athlete not found in this test");
      }

      const path = `tables/${tableIndex}/rows/${rowIndex}`;
      const row = table.rows[rowIndex];
      
      // Determine trend based on old value
      const oldValue = row.value;
      let trend = 'neutral';
      if (newValue > oldValue) trend = 'up';
      if (newValue < oldValue) trend = 'down';

      // Create history entry from the OLD value
      const historyEntry: HistoryEntry = {
        date: new Date().toISOString(),
        value: oldValue
      };
      
      // Safely get existing history
      let currentHistory: HistoryEntry[] = [];
      if (row.history) {
          if (Array.isArray(row.history)) {
              currentHistory = row.history;
          } else {
              // In case Firebase returns it as an object
              currentHistory = Object.values(row.history);
          }
      }

      const newHistory = [...currentHistory, historyEntry];

      const updates: any = {};
      updates[`${path}/value`] = newValue;
      updates[`${path}/trend`] = trend;
      updates[`${path}/history`] = newHistory;

      await update(dbRef, updates);
      return true;
    } catch (error) {
      console.error("Error updating metric:", error);
      throw error;
    }
  }
}