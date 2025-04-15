import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
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
  const formatDate = (date: Date) => {
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
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress} // Use onPress for navigation logic in the parent component
    >
      <ThemedView style={styles.card}>
        <View style={styles.thumbnailContainer}>
          {video.thumbnailUri ? (
            <Image
              source={{ uri: video.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderThumbnail, { backgroundColor: themeColor }]}>
              <IconSymbol name="play.fill" size={40} color="#ffffff" />
            </View>
          )}
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>
              {video.duration ? `${video.duration.toFixed(1)}s` : 'N/A'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {truncateText(video.name, 30)}
          </ThemedText>

          {video.description ? (
            <ThemedText style={styles.description}>
              {truncateText(video.description, 50)}
            </ThemedText>
          ) : null}

          <ThemedText style={styles.date}>
            {formatDate(video.createdAt)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
});
