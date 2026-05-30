import { openDatabase } from '../../db/connection.js';

export async function getUserByUsername(username) {
  const db = openDatabase();
  try {
    return await db.get('SELECT * FROM users WHERE username = ?', [username]);
  } finally {
    await db.close();
  }
}

export async function getUserById(id) {
  const db = openDatabase();
  try {
    return await db.get('SELECT * FROM users WHERE id = ?', [id]);
  } finally {
    await db.close();
  }
}
