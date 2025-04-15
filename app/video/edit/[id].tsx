import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MetadataForm } from '@/components/MetadataForm';
import { useVideoStore, VideoEntry } from '@/store/videoStore';
import { getVideo, updateVideo as updateDbVideo, videoTableToEntry, videoEntryToTable } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface MetadataFormData {
  name: string;
  description?: string;
}

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const { videos, updateVideo: updateStoreVideo } = useVideoStore();
  const [video, setVideo] = useState<VideoEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        console.error('Failed to load video for editing:', err);
        setError('Failed to load video details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [id, videos]);

  const handleSave = async (data: MetadataFormData) => {
    if (!video) return;

    setIsSaving(true);
    try {
      const updates = {
        name: data.name,
        description: data.description || '',
      };

      // Update SQLite
      await updateDbVideo(video.id, updates);
      // Update Zustand store
      updateStoreVideo(video.id, updates);

      Alert.alert('Success', 'Video details updated successfully!');
      router.back(); // Go back to the details screen
    } catch (err) {
      console.error('Failed to update video:', err);
      Alert.alert('Error', 'Failed to update video details.');
    } finally {
      setIsSaving(false);
    }
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
      <Stack.Screen options={{ title: `Edit: ${video.name}` }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MetadataForm 
          initialData={{ name: video.name, description: video.description }}
          onSubmit={handleSave} 
          submitButtonText={isSaving ? 'Saving...' : 'Save Changes'} 
        />
        {isSaving && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={themeColors.tint} />
          </View>
        )}
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
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
