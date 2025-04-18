import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableWithoutFeedback, PanResponder, Animated } from 'react-native';
import { Video } from 'expo-av';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface VideoScrubberProps {
  videoUri: string;
  videoDuration: number; // in seconds
  segmentDuration?: number; // in seconds, default 5
  minSegmentWidth?: number; // minimum width in percentage (1-100), default 10
  onSegmentChange?: (startTime: number, endTime: number) => void;
}

export const VideoScrubber: React.FC<VideoScrubberProps> = ({
  videoUri,
  videoDuration,
  segmentDuration = 5,
  minSegmentWidth = 10, // Default minimum width as 10% of timeline
  onSegmentChange,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const videoRef = useRef<Video>(null);

  const [scrubberWidth, setScrubberWidth] = useState(0);
  const [displayStartTime, setDisplayStartTime] = useState('00:00.000');
  const [displayEndTime, setDisplayEndTime] = useState('00:05.000');

  // Calculate selection width with minimum constraint
  const calculateSelectionWidth = () => {
    // Calculate width based on segment duration
    const calculatedWidth = (segmentDuration / videoDuration) * 100;
    // Apply minimum width constraint
    return Math.max(minSegmentWidth, calculatedWidth);
  };

  const [selectionWidth, setSelectionWidth] = useState(calculateSelectionWidth());

  // Use Animated.Value for position tracking
  const position = useRef(new Animated.Value(0)).current;
  const lastPosition = useRef(0);

  // Add listener to track position changes
  useEffect(() => {
    const listener = position.addListener(({ value }) => {
      lastPosition.current = value;
      updateTimeDisplays(value);
    });
    return () => position.removeListener(listener);
  }, []);

  // Format seconds to MM:SS.mmm
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Update time displays based on position
  const updateTimeDisplays = (positionPercent: number) => {
    const startTime = (positionPercent / 100) * videoDuration;
    const endTime = Math.min(videoDuration, startTime + segmentDuration);
    setDisplayStartTime(formatTime(startTime));
    setDisplayEndTime(formatTime(endTime));
  };

  // Handle segment updates with debounce
  const updateSegment = (positionPercent: number) => {
    if (!onSegmentChange) return;

    const startTime = (positionPercent / 100) * videoDuration;
    const endTime = Math.min(videoDuration, startTime + segmentDuration);

    // Use setTimeout for debouncing
    const timeoutId = setTimeout(() => {
      onSegmentChange(startTime, endTime);
      if (videoRef.current) {
        videoRef.current.setPositionAsync(startTime * 1000);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  };

  // Create pan responder for dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gesture) => {
      if (scrubberWidth <= 0) return;

      const dragPercent = (gesture.dx / scrubberWidth) * 100;
      const newPosition = Math.max(0, Math.min(
        100 - selectionWidth,
        lastPosition.current + dragPercent
      ));

      position.setValue(newPosition);
    },

    onPanResponderRelease: () => {
      updateSegment(lastPosition.current);
    }
  });

  // Handle direct click on scrubber
  const handleScrubberPress = (event: any) => {
    if (scrubberWidth <= 0) return;

    const x = event.nativeEvent.locationX;
    const newPosition = Math.max(0, Math.min(
      100 - selectionWidth,
      (x / scrubberWidth) * 100
    ));

    position.setValue(newPosition);
    updateSegment(newPosition);
  };

  // Update when component mounts or dependencies change
  useEffect(() => {
    // Recalculate selection width with minimum constraint
    const newSelectionWidth = calculateSelectionWidth();
    setSelectionWidth(newSelectionWidth);

    // Make sure position stays in bounds
    const maxPosition = 100 - newSelectionWidth;
    if (lastPosition.current > maxPosition) {
      position.setValue(maxPosition);
    }

    // Initial update
    if (scrubberWidth > 0) {
      updateTimeDisplays(lastPosition.current);
      updateSegment(lastPosition.current);
    }
  }, [scrubberWidth, videoDuration, segmentDuration, minSegmentWidth]);

  return (
    <ThemedView className="w-full px-4">
      {/* Time display */}
      <View className="flex-row justify-between px-2 w-full py-1">
        <ThemedText style={{ color: themeColors.tint }}>{displayStartTime}</ThemedText>
        <ThemedText style={{ color: themeColors.tint }}>{displayEndTime}</ThemedText>
      </View>

      {/* Scrubber timeline */}
      <View
        className="h-16 w-full my-4"
        onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
      >
        <TouchableWithoutFeedback onPress={handleScrubberPress}>
          <View className="absolute left-0 right-0 h-full bg-gray-200 rounded-lg overflow-hidden">
            {/* Timeline background */}
            <View className="absolute left-0 right-0 h-full flex-row">
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  className="flex-1 h-full"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'rgba(100,100,100,0.1)' : 'rgba(100,100,100,0.2)'
                  }}
                />
              ))}
            </View>

            {/* Draggable segment with minimum width */}
            <Animated.View
              className="absolute top-0 h-full bg-blue-500/60 justify-center items-center border-2 border-blue-600 rounded-lg"
              style={{
                left: position.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                }),
                width: `${selectionWidth}%`
              }}
              {...panResponder.panHandlers}
            >
              {/* Handle indicators */}
              <View className="flex-row justify-between items-center w-full h-full px-1">
                <View className="h-8 w-1 bg-white rounded-full" />
                <View className="h-8 w-1 bg-white rounded-full" />
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </ThemedView>
  );
};
