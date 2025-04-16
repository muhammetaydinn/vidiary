import { Link, Stack } from 'expo-router'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView className="flex-1 justify-center items-center p-5">
        <ThemedText type="title" className="text-center text-xl">
          This screen doesn't exist.
        </ThemedText>
        <Link href="/" className="mt-5 py-4">
          <ThemedText type="link" className="text-blue-500">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  )
}
