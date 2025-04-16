import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Video } from 'expo-av';  // expo-av kullanımı
import { VideoScrubber } from '@/components/VideoScrubber';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function CropVideoScreen() {
  const router = useRouter();
  const { videoUri, videoDuration } = useLocalSearchParams<{ videoUri: string; videoDuration: string }>();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const videoPlayerRef = useRef<Video>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const duration = parseFloat(videoDuration || '0');
  const segmentDuration = 5;

  const handleSegmentChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setPositionAsync(start * 1000);
      videoPlayerRef.current.pauseAsync();
    }
  };

  useEffect(() => {
    if (duration > 0) {
      setStartTime(0);
      setEndTime(Math.min(segmentDuration, duration));
    }
  }, [duration]);

  const handleNext = () => {
    videoPlayerRef.current?.pauseAsync();

    if (!videoUri) {
      Alert.alert('Error', 'Video URI is missing.');
      return;
    }

    router.push({
      pathname: '/modal/crop/metadata',
      params: {
        videoUri,
        startTime: startTime.toString(),
        duration: segmentDuration.toString()
      },
    });
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    // Eğer video oynuyorsa ve süre bitmemişse, videoyu devam ettir
    if (status.isPlaying) {
      if (status.positionMillis >= endTime * 1000) {
        // Endtime'ı geçerse videoyu başa sar
        videoPlayerRef.current?.setPositionAsync(startTime * 1000);
      }
    }
  };


  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Crop Video (5s)' }} />

      <View style={styles.videoWrapper}>
        <Video
          ref={videoPlayerRef}
          source={{ uri: videoUri }}
          style={styles.videoPlayer}
          resizeMode="contain"
          isLooping={false}
          useNativeControls={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate} // Burada kullanıyoruz
        />
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
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  loader: {
    marginTop: 8,
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
