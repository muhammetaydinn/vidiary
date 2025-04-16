import React, { useEffect, useState } from 'react'
import { ScrollView, ActivityIndicator, View, Alert } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { MetadataForm } from '@/components/MetadataForm'
import { useVideoStore, VideoEntry } from '@/store/videoStore'
import {
  getVideo,
  updateVideo as updateDbVideo,
  videoTableToEntry,
} from '@/services/database'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'

interface MetadataFormData {
  name: string
  description?: string
}

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const themeColors = Colors[colorScheme ?? 'light']

  const { videos, updateVideo: updateStoreVideo } = useVideoStore()
  const [video, setVideo] = useState<VideoEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
        setError('Error loading video.')
      } finally {
        setIsLoading(false)
      }
    }

    loadVideo()
  }, [id, videos])

  const handleSave = async (data: MetadataFormData) => {
    if (!video) return

    setIsSaving(true)
    try {
      const updates = {
        name: data.name,
        description: data.description || '',
      }

      await updateDbVideo(video.id, updates)
      updateStoreVideo(video.id, updates)

      Alert.alert('Success', 'Video updated successfully!')
      router.back()
    } catch (err) {
      console.error('Update failed:', err)
      Alert.alert('Error', 'Failed to update video.')
    } finally {
      setIsSaving(false)
    }
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
      <Stack.Screen options={{ title: `Edit: ${video.name}` }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <MetadataForm
          initialData={{
            name: video.name,
            description: video.description,
          }}
          onSubmit={handleSave}
          submitButtonText={isSaving ? 'Saving...' : 'Save Changes'}
        />

        {isSaving && (
          <View className="mt-5 items-center">
            <ActivityIndicator size="large" color={themeColors.tint} />
          </View>
        )}
      </ScrollView>
    </ThemedView>
  )
}
