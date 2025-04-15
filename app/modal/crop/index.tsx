import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getVideoInfo } from '@/services/videoProcessor';
import * as FileSystem from 'expo-file-system'; // Import FileSystem

export default function SelectVideoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const [isLoading, setIsLoading] = useState(false);

  const pickVideo = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Reverted to deprecated but working option
        allowsEditing: false, // We'll handle cropping ourselves
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        
        // Get video duration using FFmpeg
        // const videoInfo = await getVideoInfo(selectedVideo.uri);
        // const duration = videoInfo.duration;
        
        // Note: getVideoInfo using FFmpeg might be slow. 
        // Expo's ImagePicker provides duration directly.
        const duration = selectedVideo.duration ? selectedVideo.duration / 1000 : 0; // Convert ms to seconds

        if (duration < 5) {
           Alert.alert('Video Too Short', 'Please select a video that is at least 5 seconds long.');
           setIsLoading(false);
           return;
        }

        // --- Copy video to persistent location ---
        const tempUri = selectedVideo.uri;

        // Add robust URI validation
        if (!tempUri || typeof tempUri !== 'string') {
          console.error('Invalid video URI:', tempUri);
          Alert.alert('Error', 'Invalid video file selected');
          setIsLoading(false);
          return;
        }

        // Safely handle file extension extraction
        const uriParts = tempUri.split('.');
        const fileExtension = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'mp4';
        const fileName = `${Date.now()}.${fileExtension || 'mp4'}`;
        const persistentUri = `${FileSystem.documentDirectory}videos/${fileName}`;

        // Ensure the target directory exists
        const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}videos/`);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}videos/`, { intermediates: true });
        }

        await FileSystem.copyAsync({
          from: tempUri,
          to: persistentUri,
        });
        // --- End copy ---

        // Navigate to the cropping step with the PERSISTENT video URI and duration
        router.push({
          pathname: '/modal/crop/crop',
          params: { videoUri: persistentUri, videoDuration: duration }, // Use persistentUri
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Select Video' }} />
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Select a Video</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose a video from your library to crop a 5-second segment.
        </ThemedText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={themeColors.tint} style={styles.loader} />
        ) : (
          <Button 
            title="Select Video from Library" 
            onPress={pickVideo} 
            color={themeColors.tint} 
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  loader: {
    marginTop: 20,
  },
});
