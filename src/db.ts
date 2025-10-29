import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('images.db');

export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS edited_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_uri TEXT,
      edited_uri TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const saveEditedImage = async (originalUri: string, editedUri: string) => {
  await db.runAsync('INSERT INTO edited_images (original_uri, edited_uri) VALUES (?, ?)', [originalUri, editedUri]);
};

export const getEditedImages = async () => {
  const result = await db.getAllAsync('SELECT * FROM edited_images ORDER BY timestamp DESC');
  return result;
};

export const deleteEditedImage = async (id: number) => {
  await db.runAsync('DELETE FROM edited_images WHERE id = ?', [id]);
};
