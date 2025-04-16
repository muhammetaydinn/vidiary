import React from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { VideoEntry } from '@/store/videoStore';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';


interface VideoCardProps {
  video: VideoEntry;
  onPress?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? 'light'].tint;

  // Format date to a readable string
  const formatDate = (date: Date | string) => { // Allow string input for parsing
    // Ensure date is a valid Date object before formatting
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      // Attempt to parse if it's a string representation
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid Date';
      }
      date = parsedDate;
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Truncate text if it's too long
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <TouchableOpacity
      className="w-full mb-4"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-800 elevation-2">
        <View className="relative w-full h-44">
          {video.thumbnailUri ? (
            <Image
              source={{ uri: video.thumbnailUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View style={{ backgroundColor: themeColor }} className="w-full h-full justify-center items-center">
              <IconSymbol name="play.fill" size={40} color="#ffffff" />
            </View>
          )}
          <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
            <Text className="text-white text-xs">
              {video.duration ? `${video.duration.toFixed(1)}s` : 'N/A'}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-base font-semibold mb-1 text-black dark:text-white">
            {truncateText(video.name, 30)}
          </Text>

          {video.description ? (
            <Text className="text-sm mb-2 opacity-80 text-black dark:text-white">
              {truncateText(video.description, 50)}
            </Text>
          ) : null}

          <Text className="text-xs opacity-60 text-black dark:text-white">
            {formatDate(video.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};