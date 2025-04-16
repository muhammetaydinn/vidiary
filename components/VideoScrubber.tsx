import React, { useState, useEffect, useRef } from 'react';
import { View, Dimensions, TouchableWithoutFeedback, Animated } from 'react-native';
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
    <ThemedView className="w-full px-4">
      <View className="flex-row justify-between px-2 w-full py-1">
        <ThemedText className={`text-${themeColor}`}>
          {displayStartTime}
        </ThemedText>
        <ThemedText className={`text-${themeColor}`}>
          {displayEndTime}
        </ThemedText>
      </View>
      <View
        className="h-16 w-full"
        onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
      >
        <TouchableWithoutFeedback onPress={handlePress}>
          <View className="absolute left-0 right-0 h-full bg-gray-400 rounded-lg">
            <Animated.View
              className="absolute top-0 h-full bg-white justify-center items-center border border-black rounded-lg"
              style={{
                left: `${position}%`,
                width: `${selectionWidth}%`,
              }}
            >
              <View className="flex-1 w-full px-4 py-1 justify-center items-center">
                <View className="flex-row justify-between px-2 flex-1 w-full bg-red-500/50 border border-black" />
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </ThemedView>
  );
};
