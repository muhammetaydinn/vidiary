import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useVideoStore, VideoEntry } from '@/store/videoStore';
import { getVideo, deleteVideo as deleteDbVideo, videoTableToEntry } from '@/services/database';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import * as FileSystem from 'expo-file-system';

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const { videos, deleteVideo: deleteStoreVideo } = useVideoStore();
  const [video, setVideo] = useState<VideoEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!id) {
        setError('Video ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        // Try fetching from Zustand store first
        const storeVideo = videos.find(v => v.id === id);
        if (storeVideo) {
          setVideo(storeVideo);
        } else {
          // Fallback to SQLite if not found in store
          const dbVideo = await getVideo(id);
          if (dbVideo) {
            setVideo(videoTableToEntry(dbVideo));
          } else {
            setError('Video not found.');
          }
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        setError('Failed to load video details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [id, videos]);

  const handleDelete = () => {
    if (!video) return;

    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video diary entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Delete from SQLite
              await deleteDbVideo(video.id);
              // Delete from Zustand store
              deleteStoreVideo(video.id);
              
              // Delete video file and thumbnail file
              if (video.uri) {
                await FileSystem.deleteAsync(video.uri, { idempotent: true });
              }
              if (video.thumbnailUri) {
                await FileSystem.deleteAsync(video.thumbnailUri, { idempotent: true });
              }

              // Navigate back to home screen
              router.back();
            } catch (err) {
              console.error('Failed to delete video:', err);
              Alert.alert('Error', 'Failed to delete video.');
            }
          } 
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!video) return;
    router.push(`/video/edit/${video.id}`);
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

  if (!video) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Video not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: video.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <IconSymbol name="pencil" size={22} color={themeColors.tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <IconSymbol name="trash" size={22} color={themeColors.tint} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VideoPlayer uri={video.uri} style={styles.videoPlayer} autoPlay />
        
        <View style={styles.metadataContainer}>
          <ThemedText type="title" style={styles.title}>{video.name}</ThemedText>
          {video.description ? (
            <ThemedText style={styles.description}>{video.description}</ThemedText>
          ) : null}
          <ThemedText style={styles.date}>
            Created on: {new Date(video.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  videoPlayer: {
    marginBottom: 16,
    borderRadius: 0, // Remove border radius for full width
  },
  metadataContainer: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
});
