import React, { useState, useRef, useEffect } from 'react'; // Import useEffect
import { View, StyleSheet, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'; // Add TouchableOpacity
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoScrubber } from '@/components/VideoScrubber';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Import IconSymbol
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Video, AVPlaybackStatusSuccess } from 'expo-av'; // Import AVPlaybackStatusSuccess

export default function CropVideoScreen() {
  const router = useRouter();
  const { videoUri, videoDuration } = useLocalSearchParams<{ videoUri: string; videoDuration: string }>();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const videoPlayerRef = useRef<Video>(null); // Renamed ref for clarity
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5); // Default 5 seconds
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // State for play/pause
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for interval

  const duration = parseFloat(videoDuration || '0');
  const segmentDuration = 5; // Fixed 5-second segment

  const handleSegmentChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
    // Seek video preview to the start of the segment
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setPositionAsync(start * 1000);
      // Pause video when scrubbing starts
      videoPlayerRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Function to check playback position and loop/pause
  const checkPlaybackPosition = (status: AVPlaybackStatusSuccess) => {
    if (!status.isPlaying) return;

    const currentPositionMillis = status.positionMillis;
    const endTimeMillis = endTime * 1000;

    if (currentPositionMillis >= endTimeMillis) {
      if (videoPlayerRef.current) {
        // Pause the video instead of looping
        videoPlayerRef.current.pauseAsync();
        // Seek back to start for next play press
        videoPlayerRef.current.setPositionAsync(startTime * 1000);
        setIsPlaying(false); // Update state as it's now paused
      }
    }
  };

  // Start/Stop interval when startTime/endTime changes
  useEffect(() => {
    // Clear existing interval
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    // Set up new interval to check playback status
    playbackIntervalRef.current = setInterval(async () => {
      if (videoPlayerRef.current) {
        const status = await videoPlayerRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          checkPlaybackPosition(status);
        }
      }
    }, 100); // Check every 100ms

    // Cleanup interval on unmount or when times change
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [startTime, endTime]); // Re-run effect when segment changes

  // Toggle Play/Pause
  const togglePlayPause = async () => {
    if (!videoPlayerRef.current) return;

    const status = await videoPlayerRef.current.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await videoPlayerRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        // Ensure playback starts from the current segment start time
        await videoPlayerRef.current.setPositionAsync(startTime * 1000);
        await videoPlayerRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };


  const handleNext = () => {
    // Ensure video is paused before navigating
    videoPlayerRef.current?.pauseAsync();
    setIsPlaying(false);

    if (!videoUri) {
      Alert.alert('Error', 'Video URI is missing.');
      return;
    }
    
    // Navigate to the metadata step with video URI and selected segment times
    router.push({
      pathname: '/modal/crop/metadata',
      params: { 
        videoUri, 
        startTime: startTime.toString(), 
        duration: segmentDuration.toString() 
      },
    });
  };

  if (!videoUri || !videoDuration) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Missing video information.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Crop Video (5s)' }} />

      <View style={styles.videoWrapper}>
        <VideoPlayer
          ref={videoPlayerRef}
          uri={videoUri}
          style={styles.videoPlayer}
          autoPlay={false}
          loop={false}
          useNativeControls={false}
        />
        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
          <IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={40} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </View>


      <VideoScrubber
        videoUri={videoUri}
        videoDuration={duration}
        segmentDuration={segmentDuration}
        onSegmentChange={handleSegmentChange}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Next: Add Details" 
          onPress={handleNext} 
          color={themeColors.tint} 
          disabled={isLoading}
        />
        {isLoading && <ActivityIndicator size="small" color={themeColors.tint} style={styles.loader} />}
      </View>
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
  videoPlayer: {
    // Adjust style as needed
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border, // Use a fixed color or theme color
  },
  loader: {
    marginTop: 8,
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9, // ya da videonun oranına göre ayarla
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  }

});

