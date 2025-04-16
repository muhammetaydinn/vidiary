import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, Animated, TextInput } from 'react-native';
import { Video } from 'expo-av';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface VideoScrubberProps {
  videoUri: string;
  videoDuration: number; // in seconds
  segmentDuration?: number; // in seconds, default 5
  onSegmentChange?: (startTime: number, endTime: number) => void;
}

export const VideoScrubber: React.FC<VideoScrubberProps> = ({
  videoUri,
  videoDuration,
  segmentDuration = 5,
  onSegmentChange,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const themeColor = themeColors.tint;

  const videoRef = useRef<Video>(null);
  const [scrubberWidth, setScrubberWidth] = useState(0);
  const [position, setPosition] = useState(0); // Percentage
  const [selectionWidth, setSelectionWidth] = useState(segmentDuration / videoDuration * 100);

  const [displayStartTime, setDisplayStartTime] = useState('00:00');
  const [displayEndTime, setDisplayEndTime] = useState('00:05');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSegmentChange = (newPosition: number) => {
    if (onSegmentChange) {
      const startTime = (newPosition / 100) * videoDuration;
      const endTime = startTime + segmentDuration;
      onSegmentChange(startTime, endTime);

      if (videoRef.current) {
        videoRef.current.setPositionAsync(startTime * 1000);
      }
    }
  };

  const handlePress = (event: any) => {
    const x = event.nativeEvent.locationX;
    const newPosition = Math.max(0, Math.min(100 - selectionWidth, (x / scrubberWidth) * 100));
    setPosition(newPosition);
    handleSegmentChange(newPosition);
    setDisplayStartTime(formatTime((newPosition / 100) * videoDuration));
    setDisplayEndTime(formatTime(((newPosition / 100) * videoDuration) + segmentDuration));
  };

  useEffect(() => {
    if (scrubberWidth > 0) {
      handleSegmentChange(position);
    }
  }, [scrubberWidth, videoDuration, segmentDuration, position]);

  return (
    <ThemedView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, width: '100%', paddingVertical: 4 }}>
        <ThemedText style={{ color: themeColor }}>
          {displayStartTime}
        </ThemedText>
        <ThemedText style={{ color: themeColor }}>
          {displayEndTime}
        </ThemedText>
      </View>
      <View
        style={styles.scrubberContainer}
        onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
      >
        {/* Timeline background */}
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.timeline}>
            {/* Selection area */}
            <Animated.View
              style={[
                styles.selection,
                {
                  left: `${position}%`,
                  width: `${selectionWidth}%`,
                },
              ]}
            >
              <View style={styles.selectionInner}>
                <View style={styles.innerContainer} />
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  scrubberContainer: {
    height: 70,
    width: '100%',
  },
  timeline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'grey',
    borderRadius: 4,
  },
  selection: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 4,
  },
  selectionInner: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderWidth: 1,
  },
  durationText: {
    textAlign: 'center',
    marginTop: 15,
    color: 'black',
  },
});
