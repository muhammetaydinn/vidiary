import { create } from 'zustand';
// Removed persist and AsyncStorage imports
import {
  deleteVideo as dbDeleteVideo,
  getVideos as dbGetVideos,
  insertVideo as dbInsertVideo,
  updateVideo as dbUpdateVideo,
  videoEntryToTable,
  videoTableToEntry,
  VideoTable, // Import VideoTable type
} from '@/services/database';

export interface VideoEntry {
  id: string;
  name: string;
  description: string;
  uri: string;
  thumbnailUri: string;
  createdAt: Date;
  duration: number; // Fixed duration of 5 seconds
}

interface VideoStore {
  videos: VideoEntry[]; // List of videos in the store
  isLoading: boolean; // Loading state for video data
  loadVideos: () => Promise<void>; // Load videos from SQLite database
  addVideo: (video: Omit<VideoEntry, 'id' | 'createdAt'>) => Promise<VideoEntry | null>; // Add a new video to the store and SQLite
  updateVideo: (id: string, updates: Partial<Omit<VideoEntry, 'id' | 'createdAt'>>) => Promise<void>; // Update a video in the store and SQLite
  deleteVideo: (id: string) => Promise<void>; // Delete a video from the store and SQLite
  getVideoById: (id: string) => VideoEntry | undefined; // Get a video by ID from the store
}

export const useVideoStore = create<VideoStore>()(
  // Zustand store for managing video data
  (set, get) => ({
    videos: [],
    isLoading: false, // Initialize loading state

    // Load videos from SQLite
    loadVideos: async () => {
      set({ isLoading: true });
      try {
        const videosFromDb = await dbGetVideos();
        const videoEntries = videosFromDb.map(videoTableToEntry);
        set({ videos: videoEntries, isLoading: false });
      } catch (error) {
        console.error("Failed to load videos from database:", error);
        set({ isLoading: false }); // Ensure loading state is reset on error
      }
    },

    // Add a new video to the store and SQLite
    addVideo: async (videoData) => {
      const newVideo: VideoEntry = {
        ...videoData,
        id: crypto.randomUUID(), // Generate UUID
        createdAt: new Date(),
      };
      try {
        const videoTable = videoEntryToTable(newVideo);
        await dbInsertVideo(videoTable);
        // Update state after successful DB insertion
        set((state) => ({
          videos: [newVideo, ...state.videos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), // Keep sorted
        }));
        return newVideo; // Return the created video
      } catch (error) {
        console.error("Failed to add video:", error);
        // Optionally re-throw or handle error state in UI
        return null;
      }
    },

    // Update a video in the store and SQLite
    updateVideo: async (id, updates) => {
      // Prepare updates for the database (VideoTable format)
      const dbUpdates: Partial<VideoTable> = {};
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          // Ensure correct type mapping if necessary (e.g., Date to string)
          // In this case, VideoEntry and VideoTable share relevant fields directly
          (dbUpdates as any)[key] = (updates as any)[key];
        }
      }

      try {
        await dbUpdateVideo(id, dbUpdates);
        // Update store state after successful DB update
        set((state) => ({
          videos: state.videos.map((video) =>
            video.id === id ? { ...video, ...updates } : video
          ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), // Keep sorted
        }));
      } catch (error) {
        console.error("Failed to update video:", error);
        // Optionally re-throw or handle error state in UI
      }
    },

    // Delete a video from the store and SQLite
    deleteVideo: async (id) => {
      try {
        await dbDeleteVideo(id);
        // Update store state after successful DB deletion
        set((state) => ({
          videos: state.videos.filter((video) => video.id !== id),
        }));
      } catch (error) {
        console.error("Failed to delete video:", error);
        // Optionally re-throw or handle error state in UI
      }
    },

    // Get a video by ID from the store
    getVideoById: (id: string) => {
        return get().videos.find(video => video.id === id);
    }
  })
  // Removed persist options
);
