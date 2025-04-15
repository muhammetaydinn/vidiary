import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite'; // Use expo-sqlite/next
import { VideoEntry } from '@/store/videoStore';

export interface VideoTable {
  id: string;
  name: string;
  description: string;
  uri: string;
  thumbnailUri: string;
  createdAt: string; // ISO string
  duration: number;
}
 
let db: SQLiteDatabase | null = null;

// Open the database asynchronously
export const openDb = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    db = await openDatabaseAsync('vidiary.db');
    // Run migrations or initial setup
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        uri TEXT NOT NULL,
        thumbnailUri TEXT,
        createdAt TEXT NOT NULL,
        duration REAL NOT NULL
      );
    `);
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  try {
    await openDb(); // Ensure DB is open and initialized
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error; // Re-throw error for calling code to handle
  }
};

export const getVideos = async (): Promise<VideoTable[]> => {
  const database = await openDb();
  try {
    const results = await database.getAllAsync<VideoTable>(
      'SELECT * FROM videos ORDER BY createdAt DESC;'
    );
    return results;
  } catch (error) {
    console.error("Failed to get videos:", error);
    return []; // Return empty array on error
  }
};

export const getVideo = async (id: string): Promise<VideoTable | null> => {
  const database = await openDb();
  try {
    const result = await database.getFirstAsync<VideoTable>(
      'SELECT * FROM videos WHERE id = ?;',
      [id]
    );
    return result ?? null;
  } catch (error) {
    console.error(`Failed to get video with id ${id}:`, error);
    return null; // Return null on error
  }
};

export const insertVideo = async (video: VideoTable): Promise<void> => {
  const database = await openDb();
  try {
    await database.runAsync(
      `INSERT INTO videos (id, name, description, uri, thumbnailUri, createdAt, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        video.id,
        video.name,
        video.description,
        video.uri,
        video.thumbnailUri,
        video.createdAt,
        video.duration,
      ]
    );
  } catch (error) {
    console.error("Failed to insert video:", error);
    throw error; // Re-throw error
  }
};

export const updateVideo = async (id: string, updates: Partial<VideoTable>): Promise<void> => {
  const database = await openDb();
  try {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      // Ensure only valid columns are updated and prevent SQL injection (basic check)
      if (key !== 'id' && ['name', 'description', 'uri', 'thumbnailUri', 'createdAt', 'duration'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return; // No valid fields to update
    }

    values.push(id); // Add id for the WHERE clause

    await database.runAsync(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = ?;`,
      values
    );
  } catch (error) {
    console.error(`Failed to update video with id ${id}:`, error);
    throw error; // Re-throw error
  }
};

export const deleteVideo = async (id: string): Promise<void> => {
  const database = await openDb();
  try {
    await database.runAsync('DELETE FROM videos WHERE id = ?;', [id]);
  } catch (error) {
    console.error(`Failed to delete video with id ${id}:`, error);
    throw error; // Re-throw error
  }
};

// Convert between VideoEntry and VideoTable
export const videoEntryToTable = (video: VideoEntry): VideoTable => {
  return {
    ...video,
    createdAt: video.createdAt.toISOString(),
  };
};

export const videoTableToEntry = (video: VideoTable): VideoEntry => {
  return {
    ...video,
    createdAt: new Date(video.createdAt),
  };
};
