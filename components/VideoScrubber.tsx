import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native'; // Removed Animated import
import { Video } from 'expo-av';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  // useDerivedValue, // Not needed for this approach
  // useAnimatedProps, // Not needed for this approach
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
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
  const themeColors = Colors[colorScheme ?? 'light']; // Use themeColors object
  const themeColor = themeColors.tint; // Keep tint for specific elements
  
  const videoRef = useRef<Video>(null);
  const [scrubberWidth, setScrubberWidth] = useState(0);
  
  // Segment position values
  const startPosition = useSharedValue(0); // Percentage
  const endPosition = useSharedValue(0); // Percentage

  // State for displaying formatted times
  const [displayStartTime, setDisplayStartTime] = useState('00:00');
  const [displayEndTime, setDisplayEndTime] = useState('00:00');
  
  // Calculate pixel to time ratio (consider adding a check for scrubberWidth > 0)
  const pixelToTimeRatio = scrubberWidth > 0 ? videoDuration / scrubberWidth : 0;
  
  // Format time as MM:SS - keep this helper function
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle segment change
  const handleSegmentChange = (start: number, end: number) => {
    if (onSegmentChange) {
      const startTime = (start / 100) * videoDuration;
      const endTime = (end / 100) * videoDuration;
      onSegmentChange(startTime, endTime);
      
      // Seek video to start position
      if (videoRef.current) {
        videoRef.current.setPositionAsync(startTime * 1000);
      }
    }
  };
  
  // Start handle pan responder
  const startHandlePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(endPosition.value - (segmentDuration / videoDuration * 100), startPosition.value + (gestureState.dx / scrubberWidth * 100)));
      startPosition.value = newPosition;
      // Calculate new start time based on gesture
      const newStartPercent = startPosition.value + (gestureState.dx / scrubberWidth * 100);
      // Ensure start handle doesn't go past end handle (minus segment duration)
      const maxStartPercent = endPosition.value - (segmentDuration / videoDuration * 100);
      const clampedStartPercent = Math.max(0, Math.min(maxStartPercent, newStartPercent));
      
      startPosition.value = clampedStartPercent;
      // Update end position based on the new start position and fixed duration
      endPosition.value = clampedStartPercent + (segmentDuration / videoDuration * 100);

      // Update display times using runOnJS
      runOnJS(updateDisplayTimes)(startPosition.value, endPosition.value);
      runOnJS(handleSegmentChange)(startPosition.value, endPosition.value);
    },
  });

  // Pan responder for the entire selection bar (allows dragging the whole segment)
  const selectionPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const segmentWidthPercent = segmentDuration / videoDuration * 100;
      const deltaPercent = gestureState.dx / scrubberWidth * 100;
      
      // Calculate potential new start position
      const potentialNewStart = startPosition.value + deltaPercent;
      // Clamp within bounds [0, 100 - segmentWidthPercent]
      const newStartPercent = Math.max(0, Math.min(100 - segmentWidthPercent, potentialNewStart));
      
      startPosition.value = newStartPercent;
      endPosition.value = newStartPercent + segmentWidthPercent;
      
      // Update display times using runOnJS
      runOnJS(updateDisplayTimes)(startPosition.value, endPosition.value);
      runOnJS(handleSegmentChange)(startPosition.value, endPosition.value);
    },
  });
  
  // Animated styles for handles and selection
  const startHandleStyle = useAnimatedStyle(() => {
    return {
      left: `${startPosition.value}%`,
    };
  });
  
  // No need for endHandle pan responder if duration is fixed

  const endHandleStyle = useAnimatedStyle(() => {
    // End handle position is derived from start position + segment duration
    return {
      left: `${startPosition.value + (segmentDuration / videoDuration * 100)}%`,
    };
  });

  const selectionStyle = useAnimatedStyle(() => {
    return {
      left: `${startPosition.value}%`,
      width: `${endPosition.value - startPosition.value}%`,
    };
  });
  
  // Initialize segment position
  useEffect(() => {
    if (scrubberWidth > 0) {
      // Set initial segment to first 5 seconds or full video if shorter
      const initialEndPercent = Math.min(100, (segmentDuration / videoDuration) * 100);
      startPosition.value = 0;
      endPosition.value = initialEndPercent;
      handleSegmentChange(startPosition.value, endPosition.value);
    }
  }, [scrubberWidth, videoDuration, segmentDuration]); // Add segmentDuration dependency

  // Function to update display times, called via runOnJS
  const updateDisplayTimes = (startPercent: number, endPercent: number) => {
    setDisplayStartTime(formatTime((startPercent / 100) * videoDuration));
    setDisplayEndTime(formatTime((endPercent / 100) * videoDuration));
  };

  // Initialize display times using useEffect
  useEffect(() => {
    if (scrubberWidth > 0) {
      updateDisplayTimes(startPosition.value, endPosition.value);
    }
  }, [scrubberWidth, videoDuration, segmentDuration]); // Initial update

  // Update display times whenever shared values change (via runOnJS)
  // This useEffect might be redundant if updateDisplayTimes is always called in pan responders
  // useEffect(() => {
  //    updateDisplayTimes(startPosition.value, endPosition.value);
  // }, [startPosition.value, endPosition.value]);


  return (
    <ThemedView style={styles.container}>
      <View
        style={styles.scrubberContainer}
        onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
      >
        {/* Timeline background */}
        <View style={styles.timeline} />
        
        {/* Selected segment */}
        {/* Selected segment - make it draggable */}
        <Reanimated.View
          style={[
            styles.selection,
            { backgroundColor: themeColor },
            selectionStyle,
          ]}
          {...selectionPanResponder.panHandlers} // Add pan handlers to the selection bar
        >
          {/* Optional: Add visual indicator for dragging */}
        </Reanimated.View>

        {/* Start handle */}
        <Reanimated.View
          style={[styles.handleContainer, startHandleStyle]}
          {...startHandlePanResponder.panHandlers}
        >
          <View style={[styles.handle, { backgroundColor: themeColor }]} />
          {/* Use standard ThemedText with state */}
          <ThemedText style={styles.timeText}>
            {displayStartTime}
          </ThemedText>
        </Reanimated.View>

        {/* End handle */}
        <Reanimated.View
          style={[styles.handleContainer, endHandleStyle]}
          // No pan handlers needed for the end handle if duration is fixed
        >
          <View style={[styles.handle, { backgroundColor: themeColor }]} />
           {/* Use standard ThemedText with state */}
          <ThemedText style={styles.timeText}>
            {displayEndTime}
          </ThemedText>
        </Reanimated.View>
      </View>

      <ThemedText style={styles.durationText}>
        Segment Duration: {segmentDuration} seconds
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  scrubberContainer: {
    height: 40,
    width: '100%',
    marginVertical: 20,
    marginBottom: 10, // Added margin below scrubber
  },
  timeline: {
    position: 'absolute',
    top: 17, // Adjusted top slightly for thicker bar
    left: 0,
    right: 0,
    height: 6, // Increased thickness
    backgroundColor: '#ccc',
    borderRadius: 3, // Adjusted radius
  },
  selection: {
    position: 'absolute',
    top: 17, // Adjusted top slightly for thicker bar
    height: 6, // Increased thickness
    borderRadius: 3, // Adjusted radius
  },
  handleContainer: {
    position: 'absolute',
    top: 10,
    width: 20,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: -10,
  },
  handle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  timeText: {
    marginTop: 4,
    fontSize: 12,
  },
  durationText: {
    textAlign: 'center',
    marginTop: 15, // Increased top margin for more space
  },
});
