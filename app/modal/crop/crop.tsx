import React, { useState, useRef, useEffect } from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { Video } from 'expo-av'
import { VideoScrubber } from '@/components/VideoScrubber'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function CropVideoScreen() {
  const router = useRouter()
  const { videoUri, videoDuration } = useLocalSearchParams<{ videoUri: string; videoDuration: string }>()
  const videoPlayerRef = useRef<Video>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)

  const duration = parseFloat(videoDuration || '0')
  const segmentDuration = 5

  const handleSegmentChange = (start: number, end: number) => {
    setStartTime(start)
    setEndTime(end)
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setPositionAsync(start * 1000)
      videoPlayerRef.current.pauseAsync()
    }
  }

  useEffect(() => {
    if (duration > 0) {
      setStartTime(0)
      setEndTime(Math.min(segmentDuration, duration))
    }
  }, [duration])

  const handleNext = () => {
    videoPlayerRef.current?.pauseAsync()

    if (!videoUri) {
      Alert.alert('Error', 'Video URI is missing.')
      return
    }

    router.push({
      pathname: '/modal/crop/metadata',
      params: {
        videoUri,
        startTime: startTime.toString(),
        duration: segmentDuration.toString()
      },
    })
  }

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isPlaying && status.positionMillis >= endTime * 1000) {
      videoPlayerRef.current?.setPositionAsync(startTime * 1000)
    }
  }

  return (
    <ThemedView className="flex-1 pt-2">
      <Stack.Screen options={{ title: 'Crop Video (5s)' }} />

      <ThemedView className="relative w-full aspect-video justify-center items-center">
        <Video
          ref={videoPlayerRef}
          source={{ uri: videoUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
          isLooping={false}
          useNativeControls={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

      </ThemedView>

      <VideoScrubber
        videoUri={videoUri}
        videoDuration={duration}
        segmentDuration={segmentDuration}
        onSegmentChange={handleSegmentChange}
      />

      <TouchableOpacity className="mt-4 mx-5 bg-white border-2 border-black px-4 py-2 rounded justify-center items-center shadow-lg" onPress={handleNext}>
        <ThemedText className="text-black">Next: Add Details</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}
