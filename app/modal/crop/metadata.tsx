import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MetadataForm } from '@/components/MetadataForm';
import { useVideoStore, VideoEntry } from '@/store/videoStore';
import { insertVideo, videoEntryToTable } from '@/services/database';
import { cropVideo, initFFmpeg } from '@/services/videoProcessor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { nanoid } from 'nanoid/non-secure'; // Use non-secure for client-side ID generation
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

interface MetadataFormData {
  name: string;
  description?: string;
}

function MetadataScreenContent() {
  const router = useRouter();
  const { videoUri, startTime, duration } = useLocalSearchParams<{ 
    videoUri: string; 
    startTime: string; 
    duration: string; 
  }>();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const { addVideo: addStoreVideo } = useVideoStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false); // State for FFmpeg readiness

  // Initialize FFmpeg on component mount and track readiness
  React.useEffect(() => {
    let isMounted = true;
    initFFmpeg()
      .then(() => {
        if (isMounted) setIsFFmpegReady(true);
        console.log("FFmpeg initialized successfully in metadata screen.");
      })
      .catch(err => console.error("FFmpeg init failed in metadata screen:", err));
    
    return () => { isMounted = false; }; // Cleanup function
  }, []);

  // Tanstack Query mutation for cropping
  const cropMutation = useMutation({
    mutationFn: async (data: MetadataFormData) => {
      if (!videoUri || !startTime || !duration) {
        throw new Error('Missing video parameters for cropping.');
      }

      setIsProcessing(true);
      const start = parseFloat(startTime);
      const cropDuration = parseFloat(duration);

      const processedVideo = await cropVideo({
        videoUri,
        startTime: start,
        duration: cropDuration,
      });

      const newVideoEntry: VideoEntry = {
        id: nanoid(),
        name: data.name,
        description: data.description || '',
        uri: processedVideo.uri,
        thumbnailUri: processedVideo.thumbnailUri,
        createdAt: new Date(),
        duration: processedVideo.duration,
      };

      // Save to SQLite
      await insertVideo(videoEntryToTable(newVideoEntry));
      // Add to Zustand store
      addStoreVideo(newVideoEntry);

      return newVideoEntry;
    },
    onSuccess: () => {
      setIsProcessing(false);
      Alert.alert('Success', 'Video cropped and saved successfully!');
      // Navigate back to the home screen after successful cropping
      router.dismissAll(); // Close the modal stack
      router.replace('/'); // Go to home
    },
    onError: (error) => {
      setIsProcessing(false);
      console.error('Error cropping video:', error);
      Alert.alert('Error', `Failed to crop video: ${error.message}`);
    },
  });

  const handleSave = (data: MetadataFormData) => {
    if (!isFFmpegReady) {
      Alert.alert("Processing Error", "FFmpeg is not ready yet. Please wait.");
      return;
    }
    cropMutation.mutate(data);
  };

  if (!videoUri || !startTime || !duration) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Missing video parameters.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Add Details' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MetadataForm 
          onSubmit={handleSave} 
          submitButtonText={isProcessing ? 'Processing...' : (isFFmpegReady ? 'Crop & Save Video' : 'Initializing...')} 
          // Disable form submission if FFmpeg is not ready or already processing
          // Note: MetadataForm doesn't have a disabled prop, handle in handleSave
        />
        {!isFFmpegReady && !isProcessing && (
           <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={themeColors.text} />
            <ThemedText style={styles.loaderText}>Initializing processor...</ThemedText>
          </View>
        )}
        {isProcessing && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={themeColors.tint} />
            <ThemedText style={styles.loaderText}>Processing video...</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// Wrap the screen content with QueryClientProvider
export default function MetadataScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <MetadataScreenContent />
    </QueryClientProvider>
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
  loaderText: {
    marginTop: 8,
    fontSize: 16,
  },
});
