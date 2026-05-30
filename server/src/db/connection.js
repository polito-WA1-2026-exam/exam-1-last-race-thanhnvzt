import { DATABASE_PATH } from '../config/constants.js';
import sqlite3 from 'sqlite3';

export function getDatabasePath() {
  return DATABASE_PATH;
}

export function openDatabase() {
  const database = new sqlite3.Database(DATABASE_PATH);

  return {
    exec(sql) {
      return new Promise((resolve, reject) => {
        database.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },

    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.run(sql, params, function handleRun(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },

    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },

    close() {
      return new Promise((resolve, reject) => {
        database.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}
