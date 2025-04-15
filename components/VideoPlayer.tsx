import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText'; // Added import
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface VideoPlayerProps {
  uri: string;
  style?: any;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  useNativeControls?: boolean; // Add prop
  onLoad?: (status: AVPlaybackStatus) => void;
  onError?: (error: string) => void;
  // videoRef?: React.Ref<Video>; // Remove redundant prop
}

// Adjust type for forwardRef to exclude ref from props
type VideoPlayerComponent = React.ForwardRefRenderFunction<Video, VideoPlayerProps>;

const VideoPlayerWithRef: VideoPlayerComponent = ({ // Use forwardRef
  uri,
  style,
  autoPlay = false,
  loop = false,
  muted = false,
  useNativeControls = true, // Default to true
  onLoad,
  onError,
}, ref) => { // Receive ref
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Reset loading state when URI changes
    setIsLoading(true);
    setError(null);
  }, [uri]);

  const handleLoad = (status: AVPlaybackStatus) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(status);
    }
  };

  const handleError = (error: string) => {
    setIsLoading(false);
    setError(error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={Colors[colorScheme ?? 'light'].tint} 
          />
        </View>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <ThemedView style={styles.errorMessageContainer}>
            <ThemedText style={styles.errorMessageText}>
              Failed to load video
            </ThemedText>
          </ThemedView>
        </View>
      ) : (
        <Video
          ref={ref} // Assign forwarded ref
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping={loop}
          isMuted={muted}
          useNativeControls={useNativeControls} // Pass prop down
          onLoad={handleLoad}
          onError={(errorDetails: any) => { // Type errorDetails as any
            console.error("Video Player Error:", JSON.stringify(errorDetails, null, 2)); // Log details
            // Extract a more specific message if possible
            const errorMessage = typeof errorDetails === 'string' ? errorDetails : (errorDetails?.error?.message || 'Unknown video error');
            handleError(`Failed to load video: ${errorMessage}`); // Pass more info
          }}
        />
      )}
    </ThemedView>
  );
}; // Close component function

export const VideoPlayer = React.forwardRef(VideoPlayerWithRef); // Export the forwarded component

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorMessageContainer: { // Renamed style
    padding: 8,
    borderRadius: 4,
  },
  errorMessageText: { // Added style for the text itself
    // Add specific text styling if needed, e.g., color
  },
});
