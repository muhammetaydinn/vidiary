import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { VideoCard } from '@/components/VideoCard';
import { useVideoStore, VideoEntry } from '@/store/videoStore';
import { initDatabase, getVideos, videoTableToEntry } from '@/services/database';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use Zustand store for state management
  const { videos, addVideo } = useVideoStore();

  // Load videos from SQLite on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDatabase();
        const dbVideos = await getVideos();
        // Populate Zustand store from SQLite if it's empty
        if (videos.length === 0 && dbVideos.length > 0) {
          dbVideos.forEach(dbVideo => {
            addVideo(videoTableToEntry(dbVideo));
          });
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError('Failed to load videos.');
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // Run only once on mount

  const handleAddVideo = () => {
    // Navigate to the first step of the crop modal
    router.push('/modal/crop');
  };

  const handleVideoPress = (video: VideoEntry) => {
    router.push(`/video/${video.id}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoCard video={item} onPress={() => handleVideoPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">No videos yet!</ThemedText>
            <ThemedText>Tap the + button to add your first video diary entry.</ThemedText>
          </ThemedView>
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#fff' }]}
        onPress={handleAddVideo}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={24} color="#000" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
});
