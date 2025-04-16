import React, { useRef, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface VideoPlayerProps {
  uri: string;
  style?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  useNativeControls?: boolean;
  onLoad?: (status: AVPlaybackStatus) => void;
  onError?: (error: string) => void;
}

type VideoPlayerComponent = React.ForwardRefRenderFunction<Video, VideoPlayerProps>;

const VideoPlayerWithRef: VideoPlayerComponent = ({
  uri,
  style,
  autoPlay = false,
  loop = false,
  muted = false,
  useNativeControls = true,
  onLoad,
  onError,
}, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
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
    <ThemedView className={`w-full aspect-[16/9] rounded-lg overflow-hidden ${style}`}>
      {isLoading && (
        <View className="absolute inset-0 flex justify-center items-center bg-black/40">
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? 'light'].tint}
          />
        </View>
      )}

      {error ? (
        <View className="absolute inset-0 flex justify-center items-center bg-black/40">
          <ThemedView className="p-2 rounded-md bg-white/80">
            <ThemedText className="text-base text-center text-red-600">
              Failed to load video
            </ThemedText>
          </ThemedView>
        </View>
      ) : (
        <Video
          ref={ref}
          source={{ uri }}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping={loop}
          isMuted={muted}
          useNativeControls={useNativeControls}
          onLoad={handleLoad}
          onError={(errorDetails: any) => {
            console.error("Video Player Error:", JSON.stringify(errorDetails, null, 2));
            const errorMessage = typeof errorDetails === 'string' ? errorDetails : (errorDetails?.error?.message || 'Unknown video error');
            handleError(`Failed to load video: ${errorMessage}`);
          }}
        />
      )}
    </ThemedView>
  );
};

export const VideoPlayer = React.forwardRef(VideoPlayerWithRef);
