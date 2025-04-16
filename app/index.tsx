import React, { useEffect, useState } from 'react'
import { FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { VideoCard } from '@/components/VideoCard'
import { useVideoStore, VideoEntry } from '@/store/videoStore'
import { initDatabase, getVideos, videoTableToEntry } from '@/services/database'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'

export default function HomeScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const themeColors = Colors[colorScheme ?? 'light']

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { videos, addVideo } = useVideoStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDatabase()
        const dbVideos = await getVideos()
        if (videos.length === 0 && dbVideos.length > 0) {
          dbVideos.forEach(dbVideo => {
            addVideo(videoTableToEntry(dbVideo))
          })
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load videos:', err)
        setError('Something went wrong... Try again later!')
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddVideo = () => {
    router.push('/modal/crop')
  }

  const handleVideoPress = (video: VideoEntry) => {
    router.push(`/video/${video.id}`)
  }

  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={themeColors.tint} />
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText className="text-lg font-semibold text-center text-red-500">{error}</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView className="flex-1 bg-background">
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoCard video={item} onPress={() => handleVideoPress(item)} />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <ThemedView className="flex-1 justify-center items-center mt-12">
            <ThemedText className="text-xl font-semibold text-center">No videos yet... 😔</ThemedText>
            <ThemedText className="text-base text-center mt-2">
              Click the + button and start recording your first video diary!
            </ThemedText>
          </ThemedView>
        }
      />

      <TouchableOpacity
        className="absolute bottom-8 right-8 w-16 h-16 rounded-full justify-center items-center shadow-lg bg-white border-2 border-black"
        onPress={handleAddVideo}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={24} color={themeColors.tint} />
      </TouchableOpacity>
    </ThemedView>
  )
}
