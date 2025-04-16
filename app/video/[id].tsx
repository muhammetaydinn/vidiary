import React, { useEffect, useState } from 'react'
import { ScrollView, ActivityIndicator, TouchableOpacity, Alert, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useVideoStore, VideoEntry } from '@/store/videoStore'
import {
  getVideo,
  deleteVideo as deleteDbVideo,
  videoTableToEntry,
} from '@/services/database'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'
import * as FileSystem from 'expo-file-system'

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const themeColors = Colors[colorScheme ?? 'light']

  const { videos, deleteVideo: deleteStoreVideo } = useVideoStore()
  const [video, setVideo] = useState<VideoEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadVideo = async () => {
      if (!id) {
        setError('Video ID is missing.')
        setIsLoading(false)
        return
      }

      try {
        const storeVideo = videos.find(v => v.id === id)
        if (storeVideo) {
          setVideo(storeVideo)
        } else {
          const dbVideo = await getVideo(id)
          if (dbVideo) {
            setVideo(videoTableToEntry(dbVideo))
          } else {
            setError('Video not found.')
          }
        }
      } catch (err) {
        console.error('Failed to load video:', err)
        setError('Failed to load video details.')
      } finally {
        setIsLoading(false)
      }
    }

    loadVideo()
  }, [id, videos])

  const handleDelete = () => {
    if (!video) return

    Alert.alert('Delete Video', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDbVideo(video.id)
            deleteStoreVideo(video.id)

            if (video.uri) await FileSystem.deleteAsync(video.uri, { idempotent: true })
            if (video.thumbnailUri) await FileSystem.deleteAsync(video.thumbnailUri, { idempotent: true })

            router.back()
          } catch (err) {
            console.error('Delete error:', err)
            Alert.alert('Error', 'Failed to delete.')
          }
        },
      },
    ])
  }

  const handleEdit = () => {
    if (!video) return
    router.push(`/video/edit/${video.id}`)
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
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    )
  }

  if (!video) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText type="subtitle">Video not found.</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView className="flex-1">
      <Stack.Screen
        options={{
          title: video.name,
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity onPress={handleEdit} className="ml-4">
                <IconSymbol name="pencil" size={25} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} className="ml-4">
                <IconSymbol name="trash" size={25} color={themeColors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <VideoPlayer uri={video.uri} style={{ marginBottom: 16 }} autoPlay />

        <View className="px-4">
          <ThemedText type="title" className="mb-2">{video.name}</ThemedText>
          {video.description && (
            <ThemedText className="mb-4 text-base leading-[22px]">
              {video.description}
            </ThemedText>
          )}
          <ThemedText className="text-sm opacity-70">
            Created on: {new Date(video.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  )
}
