import React, { useState, useEffect } from 'react'
import { Alert, ActivityIndicator, ScrollView, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { MetadataForm } from '@/components/MetadataForm'
import { useVideoStore, VideoEntry } from '@/store/videoStore'
import { insertVideo, videoEntryToTable } from '@/services/database'
import { cropVideo, initFFmpeg } from '@/services/videoProcessor'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'
import { nanoid } from 'nanoid/non-secure'
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Query client
const queryClient = new QueryClient()

interface MetadataFormData {
  name: string
  description?: string
}

function MetadataScreenContent() {
  const router = useRouter()
  const { videoUri, startTime, duration } = useLocalSearchParams<{
    videoUri: string
    startTime: string
    duration: string
  }>()

  const colorScheme = useColorScheme()
  const themeColors = Colors[colorScheme ?? 'light']
  const { addVideo: addStoreVideo } = useVideoStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isFFmpegReady, setIsFFmpegReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    initFFmpeg()
      .then(() => {
        if (isMounted) setIsFFmpegReady(true)
        console.log('FFmpeg initialized successfully')
      })
      .catch(err => console.error('FFmpeg init failed:', err))

    return () => {
      isMounted = false
    }
  }, [])

  const cropMutation = useMutation({
    mutationFn: async (data: MetadataFormData) => {
      if (!videoUri || !startTime || !duration) throw new Error('Missing video parameters.')

      setIsProcessing(true)
      const processedVideo = await cropVideo({
        videoUri,
        startTime: parseFloat(startTime),
        duration: parseFloat(duration),
      })

      const newVideoEntry: VideoEntry = {
        id: nanoid(),
        name: data.name,
        description: data.description || '',
        uri: processedVideo.uri,
        thumbnailUri: processedVideo.thumbnailUri,
        createdAt: new Date(),
        duration: processedVideo.duration,
      }

      await insertVideo(videoEntryToTable(newVideoEntry))
      addStoreVideo(newVideoEntry)

      return newVideoEntry
    },
    onSuccess: () => {
      setIsProcessing(false)
      Alert.alert('Success', 'Video cropped and saved!')
      router.dismissAll()
      router.replace('/')
    },
    onError: (error) => {
      setIsProcessing(false)
      console.error('Crop error:', error)
      Alert.alert('Error', `Failed: ${error.message}`)
    },
  })

  const handleSave = (data: MetadataFormData) => {
    if (!isFFmpegReady) {
      Alert.alert('Processing Error', 'FFmpeg is not ready yet. Chill a sec.')
      return
    }
    cropMutation.mutate(data)
  }

  if (!videoUri || !startTime || !duration) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText type="subtitle">Missing video parameters.</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView className="flex-1">
      <Stack.Screen options={{ title: 'Add Details' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <MetadataForm
          onSubmit={handleSave}
          submitButtonText={
            isProcessing
              ? 'Processing...'
              : isFFmpegReady
                ? 'Crop & Save Video'
                : 'Initializing...'
          }
        />

        {!isFFmpegReady && !isProcessing && (
          <View className="mt-5 items-center">
            <ActivityIndicator size="small" color={themeColors.text} />
            <ThemedText className="mt-2 text-base">Initializing processor...</ThemedText>
          </View>
        )}

        {isProcessing && (
          <View className="mt-5 items-center">
            <ActivityIndicator size="large" color={themeColors.tint} />
            <ThemedText className="mt-2 text-base">Processing video...</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  )
}

export default function MetadataScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <MetadataScreenContent />
    </QueryClientProvider>
  )
}
