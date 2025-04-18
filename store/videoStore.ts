import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  videos: VideoEntry[];
  addVideo: (video: VideoEntry) => void;
  updateVideo: (id: string, updates: Partial<VideoEntry>) => void;
  deleteVideo: (id: string) => void;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set) => ({
      videos: [],
      addVideo: (video) => set((state) => ({ 
        videos: [video, ...state.videos] 
      })),
      updateVideo: (id, updates) => set((state) => ({
        videos: state.videos.map((video) => 
          video.id === id ? { ...video, ...updates } : video
        )
      })),
      deleteVideo: (id) => set((state) => ({
        videos: state.videos.filter((video) => video.id !== id)
      })),
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ videos: state.videos }),
    }
  )
);
