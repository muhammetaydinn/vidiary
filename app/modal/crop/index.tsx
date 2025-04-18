import React, { useState } from 'react'
import { Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'
import * as FileSystem from 'expo-file-system'

export default function SelectVideoScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const themeColors = Colors[colorScheme ?? 'light']
  const [isLoading, setIsLoading] = useState(false)

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!')
      return
    }

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      })

      if (!result.canceled && result.assets?.length > 0) {
        const selectedVideo = result.assets[0]
        const duration = selectedVideo.duration ? selectedVideo.duration / 1000 : 0

        if (duration < 5) {
          Alert.alert('Video Too Short', 'Please select a video that is at least 5 seconds long.')
          setIsLoading(false)
          return
        }

        const tempUri = selectedVideo.uri
        if (!tempUri || typeof tempUri !== 'string') {
          console.error('Invalid video URI:', tempUri)
          Alert.alert('Error', 'Invalid video file selected')
          setIsLoading(false)
          return
        }

        const uriParts = tempUri.split('.')
        const fileExtension = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'mp4'
        const fileName = `${Date.now()}.${fileExtension || 'mp4'}`
        const persistentUri = `${FileSystem.documentDirectory}videos/${fileName}`

        const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}videos/`)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}videos/`, { intermediates: true })
        }

        await FileSystem.copyAsync({
          from: tempUri,
          to: persistentUri,
        })

        router.push({
          pathname: '/modal/crop/crop',
          params: { videoUri: persistentUri, videoDuration: duration },
        })
      }
    } catch (error) {
      console.error('Error picking video:', error)
      Alert.alert('Error', 'Failed to select video.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemedView className="flex-1">
      <Stack.Screen options={{ title: 'Select Video' }} />
      <ThemedView className="flex-1 justify-center items-center p-5">
        <ThemedText type="title" className="mb-4">Select a Video</ThemedText>
        <ThemedText className="text-center mb-8 opacity-80">
          Choose a video from your library to crop a 5-second segment.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator size="large" color={themeColors.tint} className="mt-5" />
        ) : (
          <TouchableOpacity onPress={pickVideo} className="bg-white border-2 border-black px-4 py-2 rounded shadow-lg">
            <ThemedText className="text-black">Select Video from Library</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  )
}
